import { useState } from 'react';

const M = {
  overlay: 'rgba(4,8,18,0.75)',
  bg: '#0F1729',
  border: '#1B2A42',
  text: '#E2EAF4',
  muted: '#8BAFC8',
  inputBg: '#080E1C',
  orange: '#FF6B2B',
  orangeDim: '#C44E18',
};

export default function NewNoteModal({ onConfirm, onClose }) {
  const [title, setTitle] = useState('');
  const [module, setModule] = useState('');
  const [tag, setTag] = useState('');

  function handleCreate() {
    if (title.trim()) onConfirm(title.trim(), module.trim(), tag.trim());
  }

  const fields = [
    { placeholder: 'Title…', value: title, set: setTitle },
    { placeholder: 'Module', value: module, set: setModule },
    { placeholder: 'Tag', value: tag, set: setTag },
  ];

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: M.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: M.bg,
          borderRadius: 16,
          padding: 28,
          width: 360,
          border: `1px solid ${M.border}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18,
            fontWeight: 700,
            color: M.text,
            marginBottom: 20,
          }}
        >
          New note
        </div>

        {fields.map(({ placeholder, value, set }, i) => (
          <input
            key={i}
            autoFocus={i === 0}
            value={value}
            onChange={(e) => set(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '9px 12px',
              border: `1px solid ${M.border}`,
              borderRadius: 8,
              fontSize: 13,
              color: M.text,
              marginBottom: 10,
              outline: 'none',
              background: M.inputBg,
              boxSizing: 'border-box',
            }}
          />
        ))}

        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
            marginTop: 4,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: `1px solid ${M.border}`,
              borderRadius: 8,
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 13,
              color: M.muted,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 8,
              background: title.trim() ? M.orange : M.orangeDim,
              color: '#fff',
              cursor: title.trim() ? 'pointer' : 'not-allowed',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
