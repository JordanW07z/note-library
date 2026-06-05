import { tagColor } from '../tagColors.js';

const S = {
  bg: '#080E1C',
  border: '#1B2A42',
  text: '#E2EAF4',
  muted: '#8BAFC8',
  orange: '#FF6B2B',
  activeBg: 'rgba(255,107,43,0.10)',
  badgeBg: '#121E33',
};

function SidebarItem({ icon, label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '6px 16px',
        background: active ? S.activeBg : 'transparent',
        border: 'none',
        borderLeft: active ? `2px solid ${S.orange}` : '2px solid transparent',
        cursor: 'pointer',
        fontSize: 13,
        color: active ? S.orange : S.muted,
        fontWeight: active ? 600 : 400,
        textAlign: 'left',
        transition: 'background 0.1s',
      }}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      <span
        style={{
          fontSize: 11,
          background: S.badgeBg,
          color: S.muted,
          padding: '1px 6px',
          borderRadius: 10,
        }}
      >
        {count}
      </span>
    </button>
  );
}

export default function Sidebar({
  notes,
  filterModule,
  filterTag,
  setFilterModule,
  setFilterTag,
  setActiveNote,
}) {
  const modules = ['All', ...new Set(notes.map((n) => n.module))];
  const tags = ['All', ...new Set(notes.flatMap((n) => n.tags))];

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: S.bg,
        borderRight: `1px solid ${S.border}`,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 8,
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '12px 16px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: `1px solid ${S.border}`,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 20 }}>📚</span>
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 16,
            fontWeight: 700,
            color: S.text,
            letterSpacing: '-0.3px',
          }}
        >
          My Library
        </span>
      </div>

      {/* Modules */}
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: S.muted,
          padding: '8px 16px 4px',
          textTransform: 'uppercase',
        }}
      >
        Modules
      </p>
      {modules.map((m) => (
        <SidebarItem
          key={m}
          icon={m === 'All' ? '⊞' : '▸'}
          label={m}
          count={m === 'All' ? notes.length : notes.filter((n) => n.module === m).length}
          active={filterModule === m}
          onClick={() => { setFilterModule(m); setActiveNote(null); }}
        />
      ))}

      {/* Tags */}
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: S.muted,
          padding: '16px 16px 4px',
          textTransform: 'uppercase',
        }}
      >
        Tags
      </p>
      {tags.map((t) => {
        const { text } = tagColor(t);
        return (
          <SidebarItem
            key={t}
            icon={
              t === 'All'
                ? '◈'
                : <span style={{ width: 8, height: 8, borderRadius: '50%', background: text, display: 'inline-block' }} />
            }
            label={t}
            count={t === 'All' ? notes.length : notes.filter((n) => n.tags.includes(t)).length}
            active={filterTag === t}
            onClick={() => { setFilterTag(t); setActiveNote(null); }}
          />
        );
      })}
    </aside>
  );
}
