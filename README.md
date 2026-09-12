# Telugu Daily

A vanilla-JS SPA for day-wise Telugu language practice. No build tools, no dependencies.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Single HTML shell |
| `styles.css` | All styles |
| `app.js` | Rendering & SPA routing |
| `data.js` | All content (`window.APP_DATA`) |
| `manifest.json` | PWA manifest |
| `sw.js` | Service worker (offline cache) |

---

## Adding a chapter — `data.js`

### 1. Register it in `chapters[]`

```js
{
  "id": 17,           // unique integer, determines URL #chapter/17
  "number": 17,       // display number
  "title": "My Chapter",
  "displayTitle": "मेरा अध्याय",
  "themeIcon": "📖",
  "lessonCount": 20,  // word count or sentence count
  "description": "Short description shown on dashboard hero"
  // optional: "viewMode": "table"  → opens directly to All Words tab
}
```

### 2. Add content in `chapterContent["17"]`

---

#### Word / Lesson chapter (flat array)

```js
"17": [
  {
    "id": 1,
    "hindi": "जाना",
    "telugu": "వెళ్ళు",
    "hindiTransliteration": "वेल्लु",   // Devanagari only, no Latin
    "category": "verb",
    "examples": [
      {
        "hindi": "मैं जाता हूँ",
        "telugu": "నేను వెళ్తాను",
        "hindiTransliteration": "नेनु वेल्तानु"
      }
    ]
  }
  // …more words
]
```

---

#### Theory chapter (object with `theory` key)

```js
"17": {
  "theory": {
    "type": "sentences",
    "intro": "One-line concept summary shown at top",

    // optional shortcut reference table
    "shortcutTable": {
      "title": "Quick Reference",
      "tableClass": "shortcut-table--ability",  // or "shortcut-table--tense"
      "headers": ["सर्वनाम", "अंत", "सकना (गल+)", "नहीं सकना (ले+)"],
      "rows": [
        ["मैं / नेनु", "नु", "वెళ్ళగలను", "వెళ్ళలేను"],
        ["हम / मेमु", "मु", "వెళ్ళగలము", "వెళ్ళలేము"]
        // …one row per pronoun
      ]
    },

    "sentences": [
      // Section header (no quiz, just a divider)
      { "sectionLabel": "Present Tense", "sectionSub": "वर्तमान काल" },

      // Sentence card
      {
        "id": 1,
        "hindi": "मैं जा सकता हूँ",
        "transliteration": "नेनु वेल्ळगलनु",   // Devanagari
        "telugu": "నేను వెళ్ళగలను",
        "roman": "nenu vellagalanu",            // optional Latin romanization
        "wordBreakdown": [                       // optional chips shown below
          { "hindi": "मैं", "telugu": "నేను" },
          { "hindi": "जा+सक", "telugu": "వెళ్ళగల" },
          { "hindi": "ता हूँ", "telugu": "ను" }
        ],
        "note": "Tip shown with 💡 icon",        // optional
        "alt": {                                 // optional alternate form
          "hindi": "मैं जा सकती हूँ",
          "transliteration": "नेनु वेल्ळगलनु",
          "telugu": "నేను వెళ్ళగలను",
          "roman": "nenu vellagalanu",
          "wordBreakdown": []
        }
      }
    ]
  }
}
```

---

### `tableClass` options

| Class | Col 3 | Col 4 | Use for |
|-------|-------|-------|---------|
| `shortcut-table--ability` | green | red | can/cannot, could/couldn't |
| `shortcut-table--tense` | blue col2, amber col3, green col4 | — | present/past/future conjugation |

---

## Transliteration rule

All transliteration uses **Hindi/Devanagari** script only (no Latin).

Field name: `hindiTransliteration` (word cards) / `transliteration` (theory sentences).

---

## SPA routing

| URL hash | View |
|----------|------|
| `#` | Dashboard |
| `#chapter/5` | Chapter 5 (lesson or theory) |
| `#quiz/5` | Quiz for chapter 5 |

Browser back / swipe-right navigates within the app.
