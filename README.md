# Telugu Daily — Day-wise version

## Included days

- Day 1 — Pronouns
- Day 2 — He – Near & Far
- Day 3 — She & It – Near & Far
- Day 4 — Question Words
- Day 10 — Case Markers & Postpositions

The old unrelated chapter data has been removed.

## Transliteration rule

There is **no Latin/English transliteration** in this version.

All Telugu transliteration is written in **Hindi/Devanagari script only**.

Example:

Telugu:
`నా దగ్గర సమయం లేదు`

Hindi transliteration:
`ना दग्गर समयम् लेदु`

JSON field:
`hindiTransliteration`

The same rule is used in:
- word cards
- sentences
- recall quiz question
- quiz options
- correct-answer feedback

## Files

- `index.html`
- `styles.css`
- `app.js`
- `data.js`
- `data.json`

The browser loads `data.js` directly, so there is no `fetch()` and no CORS problem when opening `index.html` locally.


## v6 changes

- Word cards no longer advance on tap.
- Swipe LEFT on a word card to go to the next word.
- Swipe RIGHT to return to the previous word.
- Added mouse/pointer swipe support and keyboard arrow support.
- Added swipe direction hint to the card.
- Layout is optimized for the Google Pixel 6a CSS viewport (412 × 915).
- Uses `100dvh` on mobile and keeps the app at 412px max width.
- No jQuery, fetch(), AJAX, ES module import, or CORS dependency.
