import { useState, useCallback, useEffect } from 'react';
import { DEMO_NOTES } from './data.js';
import { getAllNotes, putNote, removeNote } from './db.js';
import Editor from './components/Editor.jsx';
import NoteModal from './components/PdfModal.jsx';

let _nextId = Date.now();
function uid() { return _nextId++; }

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

const C = {
  bg: '#080E1C',
  surface: '#0F1729',
  border: '#1B2A42',
  text: '#E2EAF4',
  muted: '#8BAFC8',
  amber: '#FF6B2B',
  amberDim: 'rgba(255,107,43,0.10)',
  rowHover: '#121E33',
};

const selectStyle = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  color: C.muted,
  fontSize: 13,
  padding: '7px 10px',
  outline: 'none',
  cursor: 'pointer',
  width: '100%',
};

const ADMIN_PASSWORD = 'J79038078w';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  function toggleAdmin() {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      const pw = window.prompt('Enter password:');
      if (pw === ADMIN_PASSWORD) setIsAdmin(true);
    }
  }

  const [fCategory, setFCategory] = useState('All');
  const [fSubject, setFSubject] = useState('All');
  const [fYear, setFYear] = useState('All');
  const [fType, setFType] = useState('All');
  const [fName, setFName] = useState('');

  // ── Load from IndexedDB ──────────────────────────────────────────────────
  useEffect(() => {
    getAllNotes().then((saved) => {
      if (saved.length > 0) {
        setNotes(saved);
      } else {
        setNotes(DEMO_NOTES);
        DEMO_NOTES.forEach((n) => putNote(n));
      }
      setLoaded(true);
    });
  }, []);

  // ── Derived filter options ───────────────────────────────────────────────
  const uniq = (arr) => ['All', ...new Set(arr.filter(Boolean))];
  const categories = uniq(notes.map((n) => n.module));
  const subjects   = uniq(notes.map((n) => n.subject));
  const years      = uniq(notes.map((n) => n.year)).sort((a, b) => b === 'All' ? -1 : b - a);
  const types      = uniq(notes.map((n) => n.documentType));

  const filtered = notes.filter((n) => {
    if (fCategory !== 'All' && n.module !== fCategory) return false;
    if (fSubject  !== 'All' && n.subject !== fSubject)  return false;
    if (fYear     !== 'All' && n.year !== fYear)         return false;
    if (fType     !== 'All' && n.documentType !== fType) return false;
    if (fName.trim()) {
      const q = fName.toLowerCase();
      if (!n.title.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const activeNote = notes.find((n) => n.id === activeId) ?? null;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const updateNote = useCallback((field, val) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== activeId) return n;
        const updated = { ...n, [field]: val };
        putNote(updated);
        return updated;
      })
    );
  }, [activeId]);

  function createNote({ title, body, module, subject, year, documentType, uploadedBy, tags, isPdf, pdfArrayBuffer }) {
    const n = {
      id: uid(),
      title,
      body,
      module,
      subject,
      year,
      documentType,
      uploadedBy: uploadedBy || 'me',
      tags,
      pinned: false,
      created: new Date().toISOString().slice(0, 10),
      isPdf,
      pdfArrayBuffer: pdfArrayBuffer ?? null,
    };
    setNotes((prev) => [n, ...prev]);
    putNote(n);
    setActiveId(n.id);
    setShowModal(false);
  }

  function deleteNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    removeNote(id);
    setActiveId(null);
  }

  function downloadNote(note, e) {
    e.stopPropagation();
    if (!note.pdfArrayBuffer) return;
    const blob = new Blob([note.pdfArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: C.bg, color: C.muted, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden' }}>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{
          padding: '18px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "'Playfair Display', serif" }}>
            Library
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isAdmin && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  padding: '8px 18px',
                  border: `1px solid ${C.amber}`,
                  borderRadius: 6,
                  background: 'transparent',
                  color: C.amber,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add Document
              </button>
            )}
            <button
              onClick={toggleAdmin}
              title={isAdmin ? 'Lock (exit admin)' : 'Unlock admin'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, opacity: isAdmin ? 1 : 0.4, padding: 4 }}
            >
              {isAdmin ? '🔓' : '🔒'}
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div style={{ padding: '20px 32px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 14 }}>
            {[
              { label: 'Category', val: fCategory, set: setFCategory, opts: categories, ph: 'All' },
              { label: 'Subject',  val: fSubject,  set: setFSubject,  opts: subjects,   ph: 'All' },
              { label: 'Year',     val: fYear,     set: setFYear,     opts: years,      ph: 'All' },
              { label: 'Document Type', val: fType, set: setFType,    opts: types,      ph: 'All' },
            ].map(({ label, val, set, opts, ph }) => (
              <div key={label}>
                <p style={{ fontSize: 12, color: C.text, marginBottom: 6, fontWeight: 500 }}>{label}</p>
                <select value={val} onChange={(e) => set(e.target.value)} style={selectStyle}>
                  <option value="All">{ph}</option>
                  {opts.filter((o) => o !== 'All').map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div>
            <p style={{ fontSize: 12, color: C.text, marginBottom: 6, fontWeight: 500 }}>Document Name</p>
            <input
              value={fName}
              onChange={(e) => setFName(e.target.value)}
              placeholder="Document name…"
              style={{
                ...selectStyle,
                width: '100%',
                boxSizing: 'border-box',
                color: C.text,
              }}
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '28%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['Document Name', 'Category', 'Subject', 'Type', 'Year', 'Uploaded On', 'Download'].map((col) => (
                  <th key={col} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.text,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    position: 'sticky',
                    top: 0,
                    background: C.bg,
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 0', color: C.muted, fontSize: 14 }}>
                    No documents found
                  </td>
                </tr>
              ) : (
                filtered.map((note) => (
                  <TableRow
                    key={note.id}
                    note={note}
                    active={activeId === note.id}
                    onOpen={() => setActiveId(note.id)}
                    onDownload={(e) => downloadNote(note, e)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Editor overlay ── */}
      {activeNote && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
          display: 'flex',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
        }}>
          <Editor
            note={activeNote}
            notes={notes}
            onChange={updateNote}
            onDelete={deleteNote}
            onClose={() => setActiveId(null)}
            isAdmin={isAdmin}
          />
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && <NoteModal onConfirm={createNote} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function TableRow({ note, active, onOpen, onDownload }) {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: `1px solid ${C.border}`,
        background: active ? C.amberDim : hovered ? C.rowHover : 'transparent',
        transition: 'background 0.1s',
        cursor: 'pointer',
      }}
      onClick={onOpen}
    >
      <td style={{ padding: '14px 16px', maxWidth: 280, minWidth: 180 }}>
        <span style={{ color: C.amber, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {note.pinned && <span style={{ marginRight: 6, fontSize: 11 }}>📌</span>}
          {note.title}
        </span>
      </td>
      <Cell>{note.module || '—'}</Cell>
      <Cell>{note.subject || (note.tags?.[0]) || '—'}</Cell>
      <Cell>{note.documentType || '—'}</Cell>

      <Cell>{note.year || new Date(note.created).getFullYear()}</Cell>
      <Cell>{formatDate(note.created)}</Cell>
      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
        {note.isPdf && note.pdfArrayBuffer ? (
          <button
            onClick={onDownload}
            title="Download PDF"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 18, lineHeight: 1 }}
          >
            ⬇
          </button>
        ) : (
          <span style={{ color: C.border }}>—</span>
        )}
      </td>
    </tr>
  );
}

function Cell({ children }) {
  return (
    <td style={{ padding: '14px 16px', fontSize: 13, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {children}
    </td>
  );
}
