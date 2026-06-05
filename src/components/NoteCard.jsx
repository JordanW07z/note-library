import { useState } from 'react';
import Pill from './Pill.jsx';

const N = {
  bg: '#0F1729',
  bgActive: '#121E33',
  border: '#1B2A42',
  orange: '#FF6B2B',
  text: '#E2EAF4',
  muted: '#8BAFC8',
};

export default function NoteCard({ note, active, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: active ? N.bgActive : N.bg,
        border: active ? `1.5px solid ${N.orange}` : `1px solid ${N.border}`,
        borderLeft: note.isPdf
          ? `3px solid ${N.orange}`
          : active
          ? `1.5px solid ${N.orange}`
          : `1px solid ${N.border}`,
        borderRadius: 12,
        padding: '14px 16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        transition: 'box-shadow 0.15s, border-color 0.15s',
        boxShadow: active
          ? `0 0 0 3px rgba(255,107,43,0.12)`
          : hovered
          ? '0 2px 12px rgba(0,0,0,0.3)'
          : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        {note.pinned && (
          <span style={{ color: '#F87171', fontSize: 13, marginTop: 1 }}>📌</span>
        )}
        {note.isPdf && (
          <span style={{ color: N.orange, fontSize: 13, marginTop: 1 }}>📄</span>
        )}
        <span
          style={{ fontSize: 14, fontWeight: 600, color: N.text, lineHeight: 1.4 }}
        >
          {note.title}
        </span>
      </div>

      <p
        style={{
          fontSize: 12,
          color: N.muted,
          lineHeight: 1.6,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {note.body || <em style={{ color: N.muted }}>Empty note</em>}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
          marginTop: 'auto',
        }}
      >
        {note.tags.map((t) => (
          <Pill key={t} tag={t} />
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: N.muted }}>
          {new Date(note.created).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
          })}
        </span>
      </div>
    </div>
  );
}
