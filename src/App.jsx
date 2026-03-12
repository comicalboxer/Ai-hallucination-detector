import React, { useState, useRef, useEffect, useCallback } from 'react';
import HeroHeader from './components/HeroHeader.jsx';
import TextInputPanel from './components/TextInputPanel.jsx';
import LoadingView from './components/LoadingView.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import { segmentSentences } from './lib/textHelper.js';

// Create the Web Worker
function createWorker() {
  return new Worker(new URL('./lib/worker.js', import.meta.url), { type: 'module' });
}

export default function App() {
  const [view, setView] = useState('idle'); // 'idle' | 'loading' | 'results'
  const [inputText, setInputText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [results, setResults] = useState(null);
  const workerRef = useRef(null);

  // Initialize the worker once
  useEffect(() => {
    workerRef.current = createWorker();

    workerRef.current.onmessage = (e) => {
      const { type, message, sentences, hallucinationScore } = e.data;

      if (type === 'status') {
        setStatusMessage(message);
      } else if (type === 'result') {
        setResults({ sentences, hallucinationScore });
        setView('results');
      } else if (type === 'error') {
        console.error('Worker error:', message);
        setStatusMessage('⚠️ Error: ' + message);
        // Fallback to a graceful error display after 2s
        setTimeout(() => setView('idle'), 3000);
      }
    };

    // Warmup the worker so model starts downloading immediately (optional)
    // workerRef.current.postMessage({ type: 'warmup' });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleAnalyze = useCallback(() => {
    const text = inputText.trim();
    if (!text || text.length < 20) return;

    const sentences = segmentSentences(text);
    if (sentences.length === 0) return;

    setView('loading');
    setStatusMessage('Initializing...');
    setResults(null);

    workerRef.current.postMessage({
      type: 'analyze',
      sentences,
      fullText: text,
    });
  }, [inputText]);

  const handleReset = useCallback(() => {
    setView('idle');
    setResults(null);
    setInputText('');
    setStatusMessage('');
  }, []);

  return (
    <div className="app-container">
      <HeroHeader />

      {view === 'idle' && (
        <TextInputPanel
          value={inputText}
          onChange={setInputText}
          onAnalyze={handleAnalyze}
        />
      )}

      {view === 'loading' && <LoadingView statusMessage={statusMessage} />}

      {view === 'results' && results && (
        <ResultsPanel
          hallucinationScore={results.hallucinationScore}
          sentences={results.sentences}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
