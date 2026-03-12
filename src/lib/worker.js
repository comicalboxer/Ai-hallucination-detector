/**
 * worker.js
 * Web Worker that runs @xenova/transformers ML inference off the main thread.
 * This prevents the popup UI from freezing during embedding computation.
 */

import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to use remote model fetching
// (models are cached in browser storage after first load)
env.allowLocalModels = false;
env.useBrowserCache = true;

let embedder = null;
let isLoading = false;

/**
 * Lazily initializes the embedding pipeline.
 * Model: Xenova/all-MiniLM-L6-v2 (~22MB, very fast)
 */
async function getEmbedder() {
  if (embedder) return embedder;
  if (isLoading) {
    // Wait until loading completes
    await new Promise((resolve) => {
      const check = setInterval(() => {
        if (!isLoading) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
    return embedder;
  }

  isLoading = true;
  self.postMessage({ type: 'status', message: 'Loading AI model (first time only)...' });

  try {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      progress_callback: (progress) => {
        if (progress.status === 'downloading') {
          self.postMessage({
            type: 'progress',
            file: progress.file,
            loaded: progress.loaded,
            total: progress.total,
          });
        }
      },
    });
    isLoading = false;
    return embedder;
  } catch (error) {
    isLoading = false;
    throw error;
  }
}

/**
 * Generates a normalized mean-pooled embedding for a piece of text.
 * @param {object} pipe - The transformers pipeline
 * @param {string} text - Text to embed
 * @returns {number[]} Embedding vector
 */
async function embed(pipe, text) {
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Computes cosine similarity between two embedding vectors.
 */
function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const mag = Math.sqrt(magA) * Math.sqrt(magB);
  return mag === 0 ? 0 : Math.max(0, Math.min(1, dot / mag));
}

/**
 * Main analysis function: embeds fullText and each sentence, then computes support scores.
 */
async function analyze({ sentences, fullText }) {
  const pipe = await getEmbedder();

  self.postMessage({ type: 'status', message: 'Embedding full context...' });
  const ctxEmbedding = await embed(pipe, fullText);

  const results = [];
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    self.postMessage({
      type: 'status',
      message: `Analyzing sentence ${i + 1} of ${sentences.length}...`,
    });

    const sentEmbedding = await embed(pipe, sentence);
    const supportScore = cosineSimilarity(ctxEmbedding, sentEmbedding);

    // Also compare this sentence against all other sentences for cross-checking
    // (detects internal inconsistencies, not just context drift)
    let crossScoreSum = 0;
    let crossCount = 0;
    for (let j = 0; j < sentences.length; j++) {
      if (i !== j) {
        const otherEmbedding = await embed(pipe, sentences[j]);
        crossScoreSum += cosineSimilarity(sentEmbedding, otherEmbedding);
        crossCount++;
      }
    }
    const crossScore = crossCount > 0 ? crossScoreSum / crossCount : supportScore;

    // Weighted blend: 60% context support, 40% cross-sentence consistency
    const blendedScore = supportScore * 0.6 + crossScore * 0.4;

    results.push({
      text: sentence,
      supportScore: Math.round(blendedScore * 100) / 100,
      contextScore: Math.round(supportScore * 100) / 100,
      crossScore: Math.round(crossScore * 100) / 100,
    });
  }

  // Compute overall hallucination percentage
  const avgSupport = results.reduce((sum, r) => sum + r.supportScore, 0) / results.length;
  const hallucinationPct = Math.round(Math.max(0, Math.min(100, (1 - avgSupport) * 100)));

  self.postMessage({
    type: 'result',
    sentences: results,
    hallucinationScore: hallucinationPct,
  });
}

// Message handler
self.onmessage = async (event) => {
  const { type, sentences, fullText } = event.data;

  if (type === 'analyze') {
    try {
      await analyze({ sentences, fullText });
    } catch (error) {
      self.postMessage({ type: 'error', message: error.message || 'Analysis failed' });
    }
  } else if (type === 'warmup') {
    try {
      await getEmbedder();
      self.postMessage({ type: 'ready' });
    } catch (error) {
      self.postMessage({ type: 'error', message: error.message });
    }
  }
};
