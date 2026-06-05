# 📚 My Library — Personal Notes App

A personal web library to store, search, and filter your notes — with PDF import.

## Features

- **Browse by module** — organise notes into subjects (Calculus, CS, etc.)
- **Filter by tag** — quickly find notes by topic tag
- **Full-text search** — searches title, body, and tags simultaneously
- **PDF import** — drag and drop a PDF; text is extracted and saved as a note
- **Pin notes** — important notes float to the top
- **Inline editor** — edit title, body, tags, and module in a side panel

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Then open http://localhost:5173 in your browser.

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

## Project structure

```
src/
  App.jsx                  ← root component, state management
  data.js                  ← demo seed notes
  tagColors.js             ← tag colour palette
  main.jsx                 ← React entry point
  components/
    Sidebar.jsx            ← module + tag filter sidebar
    NoteCard.jsx           ← note card in the grid
    Editor.jsx             ← right-side editor panel
    PdfModal.jsx           ← PDF import modal (uses pdf.js from CDN)
    NewNoteModal.jsx       ← new note creation modal
    Pill.jsx               ← coloured tag pill
```

## Notes

- PDF.js is loaded from CDN on first use — no npm install needed.
- Notes are kept in React state (in-memory). To persist across refreshes,
  you can add `localStorage` in `App.jsx` — replace `useState(DEMO_NOTES)`
  with something like:

```js
const [notes, setNotes] = useState(() => {
  try {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : DEMO_NOTES;
  } catch { return DEMO_NOTES; }
});

// then after every setNotes call, persist:
useEffect(() => {
  localStorage.setItem('notes', JSON.stringify(notes));
}, [notes]);
```
