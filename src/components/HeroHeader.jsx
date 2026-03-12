import React from 'react';

const messages = [
  "Let's check if your AI is telling the truth! 🔍",
  "Paste any AI-generated text below",
  "We'll spot inconsistencies in seconds ✨",
];

export default function HeroHeader() {
  return (
    <div className="hero-header">
      <div className="logo-ring">
        <span className="logo-emoji">🧠</span>
      </div>
      <h1 className="hero-title">Hallucination Detector</h1>
      <p className="hero-subtitle">{messages[0]}</p>
    </div>
  );
}
