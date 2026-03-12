import React, { useState, useEffect } from 'react';
import { classifyOverallRisk } from '../lib/textHelper.js';
import SentenceCard from './SentenceCard.jsx';

export default function ResultsPanel({ hallucinationScore, sentences, onReset }) {
  const [displayScore, setDisplayScore] = useState(0);
  const risk = classifyOverallRisk(hallucinationScore);

  // Animate the score counting up
  useEffect(() => {
    let start = 0;
    const target = hallucinationScore;
    const duration = 1200;
    const step = (target / duration) * 16;

    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [hallucinationScore]);

  const circumference = 2 * Math.PI * 54; // r=54
  const strokeOffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="results-panel fade-in-up">
      {/* Score gauge */}
      <div className="gauge-container" style={{ '--risk-glow': risk.bgGlow }}>
        <svg className="gauge-svg" viewBox="0 0 120 120" width="140" height="140">
          {/* Background track */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          {/* Animated score arc */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={risk.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={risk.color} />
            </linearGradient>
          </defs>
          {/* Score text */}
          <text x="60" y="55" textAnchor="middle" className="gauge-percent">{displayScore}%</text>
          <text x="60" y="72" textAnchor="middle" className="gauge-label">hallucination</text>
        </svg>

        <div className="risk-badge" style={{ background: risk.gradient }}>
          {risk.label}
        </div>
      </div>

      {/* Friendly message */}
      <div className="result-message" style={{ borderColor: risk.color }}>
        {hallucinationScore < 35 && (
          <p>✅ <strong>Looks trustworthy!</strong> This text shows strong internal consistency.</p>
        )}
        {hallucinationScore >= 35 && hallucinationScore < 60 && (
          <p>⚠️ <strong>Some inconsistencies detected.</strong> A few statements may be unsupported.</p>
        )}
        {hallucinationScore >= 60 && (
          <p>🚨 <strong>High hallucination risk!</strong> Many statements seem inconsistent or unsupported.</p>
        )}
      </div>

      {/* Sentence breakdown */}
      <div className="sentences-section">
        <h3 className="sentences-title">
          📋 Sentence Analysis <span className="sentence-count">({sentences.length})</span>
        </h3>
        <div className="sentences-list">
          {sentences.map((sentence, idx) => (
            <SentenceCard
              key={idx}
              index={idx}
              sentence={sentence}
              delay={idx * 80}
            />
          ))}
        </div>
      </div>

      <button className="reset-btn" onClick={onReset}>
        ← Analyze Another Text
      </button>
    </div>
  );
}
