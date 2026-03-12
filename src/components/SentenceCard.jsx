import React, { useState, useEffect, useRef } from 'react';
import { scoreToRisk } from '../lib/textHelper.js';

export default function SentenceCard({ sentence, index, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  const risk = scoreToRisk(sentence.supportScore);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      // Animate bar after card appears
      setTimeout(() => setBarWidth(Math.round(sentence.supportScore * 100)), 200);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, sentence.supportScore]);

  return (
    <div
      className={`sentence-card ${visible ? 'card-visible' : 'card-hidden'}`}
      style={{
        borderLeftColor: risk.color,
        backgroundColor: risk.bgColor,
      }}
    >
      <div className="card-header">
        <span className="card-index">#{index + 1}</span>
        <span className="card-risk" style={{ color: risk.color }}>
          {risk.emoji} {risk.label}
        </span>
        <span className="card-score" style={{ color: risk.color }}>
          {Math.round(sentence.supportScore * 100)}%
        </span>
      </div>

      <p className="card-text">{sentence.text}</p>

      {/* Support score bar */}
      <div className="support-bar-track">
        <div
          className="support-bar-fill"
          style={{
            width: `${barWidth}%`,
            background: risk.color,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
      <div className="support-bar-label">
        <span>Support Score</span>
        <span style={{ color: risk.color }}>{Math.round(sentence.supportScore * 100)}%</span>
      </div>
    </div>
  );
}
