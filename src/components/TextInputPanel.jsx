import React, { useRef } from 'react';

const PLACEHOLDER = `Paste AI-generated text here...

Example: "The Eiffel Tower was built in 1889 by Gustave Eiffel and stands 330 meters tall in Paris, France."`;

export default function TextInputPanel({ value, onChange, onAnalyze }) {
  const textareaRef = useRef(null);
  const charCount = value.length;
  const canAnalyze = value.trim().length >= 20;

  return (
    <div className="input-panel fade-in-up">
      <div className="textarea-wrapper">
        <textarea
          ref={textareaRef}
          className="text-input"
          placeholder={PLACEHOLDER}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
        />
        <div className="char-count">{charCount} chars</div>
      </div>

      {!canAnalyze && value.length > 0 && (
        <p className="hint-text">⚡ Please enter at least 20 characters</p>
      )}

      <button
        className={`analyze-btn ${canAnalyze ? 'active' : 'disabled'}`}
        onClick={onAnalyze}
        disabled={!canAnalyze}
      >
        <span className="btn-icon">✨</span>
        Analyze Text
      </button>

      <p className="privacy-note">🔒 100% private — runs entirely in your browser</p>
    </div>
  );
}
