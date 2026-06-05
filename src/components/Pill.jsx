import { tagColor } from '../tagColors.js';

export default function Pill({ tag, onRemove }) {
  const { bg, text } = tagColor(tag);
  return (
    <span
      style={{
        background: bg,
        color: text,
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 20,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {tag}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: text,
            fontSize: 12,
            lineHeight: 1,
            padding: 0,
            opacity: 0.6,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}
