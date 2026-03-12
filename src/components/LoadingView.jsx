import React, { useState, useEffect } from 'react';

const ROTATING_MESSAGES = [
  'Scanning for hallucinations...',
  'Comparing sentence consistency...',
  'Computing semantic similarity...',
  'Cross-referencing statements...',
  'Detecting inconsistencies...',
  'Almost there...',
];

export default function LoadingView({ statusMessage }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % ROTATING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-view fade-in-up">
      {/* Animated scanner */}
      <div className="scanner-container">
        <div className="scanner-ring ring-1" />
        <div className="scanner-ring ring-2" />
        <div className="scanner-ring ring-3" />
        <div className="scanner-core">🧠</div>
      </div>

      <h2 className="loading-title">{ROTATING_MESSAGES[msgIndex]}</h2>

      <p className="loading-status">{statusMessage || 'Initializing AI engine...'}</p>

      {/* Shimmer dots */}
      <div className="shimmer-dots">
        <div className="dot" style={{ animationDelay: '0s' }} />
        <div className="dot" style={{ animationDelay: '0.2s' }} />
        <div className="dot" style={{ animationDelay: '0.4s' }} />
      </div>

      <p className="first-time-note">
        💡 First run downloads a ~22MB model. Subsequent runs are instant!
      </p>
    </div>
  );
}
