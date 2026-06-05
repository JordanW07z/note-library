import { useState, useEffect } from 'react';
import { getPdfUrl } from '../db.js';

const C = {
  bg: '#080E1C',
  surface: '#0F1729',
  surfaceHigh: '#121E33',
  border: '#1B2A42',
  text: '#E2EAF4',
  muted: '#8BAFC8',
  amber: '#FF6B2B',
  danger: '#F85149',
};

const DOC_TYPES = ['Notes/Practices', 'Lecture Notes', 'Exam Papers', 'Tutorials', 'Cheatsheet', 'Other'];

export default function Editor({ note, notes, onChange, onDelete, onClose, isAdmin, isMobile }) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  useEffect(() => {
    if (!note.isPdf) { setPdfBlobUrl(null); return; }
    if (note.pdfArrayBuffer) {
      const blob = new Blob([note.pdfArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (note.pdfPath) {
      getPdfUrl(note.pdfPath).then(setPdfBlobUrl).catch(() => setPdfBlobUrl(null));
    } else {
      setPdfBlobUrl(null);
    }
  }, [note.id, note.pdfArrayBuffer, note.pdfPath]);

  const categories = [...new Set(notes.map((n) => n.module).filter(Boolean))];

  const inputStyle = {
    background: C.surfaceHigh,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    color: C.text,
    fontSize: 12,
    padding: '5px 9px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle = { fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 };

  return (
    <div style={{
      width: isMobile ? '100vw' : (note.isPdf && pdfBlobUrl ? 720 : 420),
      minWidth: isMobile ? '100vw' : (note.isPdf && pdfBlobUrl ? 720 : 420),
      background: C.surface,
      borderLeft: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'width 0.2s',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        {isAdmin && (
          <button
            onClick={() => onChange('pinned', !note.pinned)}
            title={note.pinned ? 'Unpin' : 'Pin'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, opacity: note.pinned ? 1 : 0.3, padding: 4 }}
          >
            📌
          </button>
        )}
        <span style={{ fontSize: 12, color: C.muted, flex: 1 }}>
          {note.isPdf ? '📄 PDF Document' : '📝 Note'}
        </span>
        {isAdmin && (
          <button
            onClick={() => { if (window.confirm('Delete this document?')) onDelete(note.id); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, padding: 4, color: C.danger }}
          >
            🗑
          </button>
        )}
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: C.muted, padding: 4 }}
        >
          ✕
        </button>
      </div>

      {/* Title */}
      <input
        value={note.title}
        onChange={(e) => isAdmin && onChange('title', e.target.value)}
        readOnly={!isAdmin}
        placeholder="Document title…"
        style={{
          border: 'none',
          outline: 'none',
          fontSize: 16,
          fontWeight: 700,
          color: C.text,
          padding: '14px 16px 10px',
          fontFamily: "'Playfair Display', serif",
          background: 'transparent',
          width: '100%',
          boxSizing: 'border-box',
          flexShrink: 0,
          cursor: isAdmin ? 'text' : 'default',
        }}
      />

      {/* Metadata fields */}
      <div style={{
        padding: '0 16px 12px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        <div>
          <p style={labelStyle}>Category</p>
          <input value={note.module || ''} onChange={(e) => isAdmin && onChange('module', e.target.value)} readOnly={!isAdmin} placeholder="Category" style={{ ...inputStyle, cursor: isAdmin ? 'text' : 'default' }} />
        </div>
        <div>
          <p style={labelStyle}>Subject</p>
          <input value={note.subject || ''} onChange={(e) => isAdmin && onChange('subject', e.target.value)} readOnly={!isAdmin} placeholder="Subject" style={{ ...inputStyle, cursor: isAdmin ? 'text' : 'default' }} />
        </div>
        <div>
          <p style={labelStyle}>Year</p>
          <input value={note.year || ''} onChange={(e) => isAdmin && onChange('year', e.target.value)} readOnly={!isAdmin} placeholder="Year" style={{ ...inputStyle, cursor: isAdmin ? 'text' : 'default' }} />
        </div>
        <div>
          <p style={labelStyle}>Document Type</p>
          {isAdmin ? (
            <select value={note.documentType || ''} onChange={(e) => onChange('documentType', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">—</option>
              {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          ) : (
            <p style={{ ...inputStyle, margin: 0, cursor: 'default' }}>{note.documentType || '—'}</p>
          )}
        </div>
      </div>

      {/* Body / PDF viewer */}
      {note.isPdf && pdfBlobUrl ? (
        <iframe
          src={pdfBlobUrl}
          title={note.title}
          style={{ flex: 1, border: 'none', width: '100%', minHeight: 0 }}
        />
      ) : (
        <textarea
          value={note.body}
          onChange={(e) => isAdmin && onChange('body', e.target.value)}
          readOnly={!isAdmin}
          placeholder="Start writing…"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: 13,
            lineHeight: 1.8,
            color: C.text,
            padding: '14px 16px',
            fontFamily: 'inherit',
            background: 'transparent',
            minHeight: 0,
            cursor: isAdmin ? 'text' : 'default',
          }}
        />
      )}

      {/* Footer */}
      <div style={{
        padding: '10px 16px',
        borderTop: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: C.muted }}>{note.created}</span>
      </div>
    </div>
  );
}
