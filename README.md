# 🧠 AI Hallucination Detector — Chrome Extension

A fully client-side Chrome Extension (Manifest V3) that detects potential hallucinations in AI-generated text using semantic similarity and cosine similarity scoring. No API keys needed. No backend. 100% private.

---

## ⚙️ How It Works

### Detection Algorithm
1. **Sentence Segmentation** — splits input using `Intl.Segmenter`
2. **Embedding Generation** — `Xenova/all-MiniLM-L6-v2` (runs via WebAssembly in browser)
3. **Cosine Similarity** — each sentence vs. full-document embedding (60% weight) + cross-sentence consistency (40% weight)
4. **Scoring** — support score per sentence → aggregate hallucination % → Low / Medium / High risk label

### Risk Thresholds
| Support Score | Risk Level | Color |
|---|---|---|
| ≥ 55% | Low Risk | 🟢 Green |
| 38–54% | Medium Risk | 🟡 Yellow |
| < 38% | High Risk | 🔴 Red |

---

## 🚀 Setup & Build

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install
```bash
cd "d:\Projects\Ai hallucination detector"
npm install
```

### Build
```bash
npm run build
```
This outputs the extension to the `dist/` folder.

> **First build takes ~30s** as Vite bundles the transformers library. Subsequent builds are fast.

---

## 🔌 Load in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `dist/` folder inside the project directory
5. The extension icon 🧠 appears in your toolbar — click it to open the popup

> **Note:** The first time you click "Analyze Text", the model (`all-MiniLM-L6-v2`, ~22MB) downloads from HuggingFace and is cached in the browser. All subsequent runs are instant.

---

## 🧪 Test Prompts

### Test 1 — High Hallucination (Expected: Red, >60%)
```
The Eiffel Tower was built in 1989 by Leonardo da Vinci as a lighthouse for the Mediterranean Sea. It is located in Berlin, Germany and stands 5,000 meters tall. The structure is made entirely of gold and was sold to the United States in 1945. It currently serves as the world's tallest underwater observation deck.
```

### Test 2 — Medium Hallucination (Expected: Yellow, 35–60%)
```
The Great Wall of China was constructed over many centuries, beginning around the 7th century BC. It stretches approximately 13,000 miles and was primarily used as a barrier against invasions. The wall is made of stone, brick, tamped earth, and even pizza, according to recent historians. Many sections of the Great Wall are well-preserved today and attract millions of tourists annually.
```

### Test 3 — Low Hallucination (Expected: Green, <35%)
```
The Eiffel Tower was built between 1887 and 1889 by Gustave Eiffel's company as the entrance arch to the 1889 World's Fair. It stands 330 meters tall and is located in Paris, France on the Champ de Mars. The tower was initially criticized by some French artists but has since become one of the most recognizable structures in the world. It attracts approximately seven million visitors per year.
```

---

## 📁 Project Structure

```
ai-hallucination-detector/
├── public/
│   ├── manifest.json        # Chrome Manifest V3
│   └── icons/               # Extension icons
├── src/
│   ├── components/
│   │   ├── HeroHeader.jsx       # Animated header
│   │   ├── TextInputPanel.jsx   # Text input + analyze button
│   │   ├── LoadingView.jsx      # Scanning animation
│   │   ├── ResultsPanel.jsx     # Score gauge + risk badge
│   │   └── SentenceCard.jsx     # Per-sentence analysis card
│   ├── lib/
│   │   ├── worker.js        # Web Worker: ML inference pipeline
│   │   └── textHelper.js    # Segmentation, cosine similarity, scoring
│   ├── App.jsx              # Main app state machine
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles + animations
├── index.html               # Popup HTML shell
├── vite.config.js           # Build configuration
└── package.json
```

---

## 🔮 Future Improvements

- **Fact-checking via external APIs** — cross-reference named entities against Wikipedia or Google Knowledge Graph
- **Model caching status indicator** — show download progress bar on first load
- **History panel** — save past analyses for comparison
- **Context upload mode** — compare AI output against a user-provided source document
- **Export report** — download analysis as PDF or JSON
- **Browser action badge** — show risk level on the extension icon
- **Sidebar mode** — detect hallucinations directly on any web page without copy-pasting
