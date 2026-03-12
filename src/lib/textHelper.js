/**
 * textHelper.js
 * Utilities for sentence segmentation, cosine similarity, and risk scoring.
 */

/**
 * Segments text into individual sentences using Intl.Segmenter.
 * Falls back to a simple regex split for environments that don't support it.
 * @param {string} text - The full input text
 * @returns {string[]} Array of sentences (trimmed, non-empty)
 */
export function segmentSentences(text) {
  if (!text || text.trim().length === 0) return [];

  try {
    const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
    const segments = [...segmenter.segment(text)];
    return segments
      .map((s) => s.segment.trim())
      .filter((s) => s.length > 10); // skip very short fragments
  } catch {
    // Fallback regex-based splitter
    return text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
  }
}

/**
 * Computes cosine similarity between two numeric arrays (embeddings).
 * @param {number[]} a - Embedding vector A
 * @param {number[]} b - Embedding vector B
 * @returns {number} Similarity score between 0 and 1
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  if (magnitude === 0) return 0;

  // Clamp to [0, 1] since embeddings can produce tiny negative values due to floating point
  return Math.max(0, Math.min(1, dot / magnitude));
}

/**
 * Converts a support score (similarity to full context) into a risk level.
 * Higher similarity → more supported → lower hallucination risk.
 *
 * Thresholds (tuned for all-MiniLM-L6-v2):
 *   >= 0.55  → Low risk    (well supported)
 *   >= 0.38  → Medium risk (weakly supported)
 *   <  0.38  → High risk   (poorly supported / potential hallucination)
 *
 * @param {number} score - Cosine similarity score (0–1)
 * @returns {{ label: string, color: string, emoji: string }}
 */
export function scoreToRisk(score) {
  if (score >= 0.55) {
    return { label: 'Low Risk', color: '#22c55e', bgColor: 'rgba(34,197,94,0.12)', emoji: '✅' };
  } else if (score >= 0.38) {
    return { label: 'Medium Risk', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.12)', emoji: '⚠️' };
  } else {
    return { label: 'High Risk', color: '#ef4444', bgColor: 'rgba(239,68,68,0.12)', emoji: '🚨' };
  }
}

/**
 * Aggregates per-sentence support scores into an overall hallucination percentage.
 * Score of 100% = completely untrustworthy, 0% = fully consistent/supported.
 *
 * @param {number[]} supportScores - Array of cosine similarity scores per sentence
 * @returns {number} Hallucination percentage (0–100)
 */
export function computeHallucinationScore(supportScores) {
  if (!supportScores || supportScores.length === 0) return 0;
  const avg = supportScores.reduce((sum, s) => sum + s, 0) / supportScores.length;
  // Invert so that low support = high hallucination score
  // Scale: similarity of 0.3 → 70% hallucination, 0.7 → 30%
  const raw = (1 - avg) * 100;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

/**
 * Classifies overall risk from a hallucination percentage.
 * @param {number} pct - Hallucination percentage (0–100)
 * @returns {{ label: string, color: string, gradient: string }}
 */
export function classifyOverallRisk(pct) {
  if (pct < 35) {
    return {
      label: 'Low Hallucination',
      color: '#22c55e',
      gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
      bgGlow: 'rgba(34,197,94,0.2)',
    };
  } else if (pct < 60) {
    return {
      label: 'Medium Hallucination',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      bgGlow: 'rgba(245,158,11,0.2)',
    };
  } else {
    return {
      label: 'High Hallucination',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      bgGlow: 'rgba(239,68,68,0.2)',
    };
  }
}
