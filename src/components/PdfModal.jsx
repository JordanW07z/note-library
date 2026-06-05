import { useState, useRef } from 'react';

async function loadPdfJs() {
  if (window.pdfjsLib) return window.pdfjsLib;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  return window.pdfjsLib;
}

const C = {
  bg: '#080E1C',
  surface: '#0F1729',
  surfaceHigh: '#121E33',
  border: '#1B2A42',
  text: '#E2EAF4',
  muted: '#8BAFC8',
  amber: '#FF6B2B',
  amberBg: 'rgba(255,107,43,0.10)',
  danger: '#F85149',
};

const DOC_TYPES = ['Notes/Practices', 'Lecture Notes', 'Exam Papers', 'Tutorials', 'Cheatsheet', 'Other'];

export default function NoteModal({ onConfirm, onClose }) {
  const [title, setTitle]               = useState('');
  const [category, setCategory]         = useState('');
  const [subject, setSubject]           = useState('');
  const [year, setYear]                 = useState(String(new Date().getFullYear()));
  const [documentType, setDocumentType] = useState('');

  const [pdfFile, setPdfFile]     = useState(null);
  const [pdfBuffer, setPdfBuffer] = useState(null);
  const [pdfText, setPdfText]     = useState('');

  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy]         = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus]     = useState('');

  const fileRef = useRef();

  async function processPdf(file) {
    if (!file || file.type !== 'application/pdf') {
      setStatus('Please drop a valid PDF file.');
      return;
    }
    setBusy(true);
    setProgress(0);
    setStatus('Reading PDF…');
    try {
      const buffer = await file.arrayBuffer();
      const derived = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      setTitle((prev) => prev || derived);

      let text = '';
      try {
        const lib = await loadPdfJs();
        const pdf = await lib.getDocument({ data: buffer.slice(0) }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          setProgress(Math.round((i / pdf.numPages) * 100));
          setStatus(`Reading page ${i} of ${pdf.numPages}…`);
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((x) => x.str).join(' ') + '\n\n';
        }
      } catch { /* text extraction is best-effort */ }

      setPdfFile(file);
      setPdfBuffer(buffer);
      setPdfText(text.trim() || '(PDF — view below)');
      setStatus('');
    } catch (err) {
      console.error(err);
      setStatus('Could not load PDF.');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  function handleCreate() {
    if (!title.trim()) return;
    onConfirm({
      title: title.trim(),
      module: category.trim() || 'General',
      subject: subject.trim(),
      year: year.trim() || String(new Date().getFullYear()),
      documentType: documentType || 'Notes/Practices',
      uploadedBy: 'me',
      tags: subject.trim() ? [subject.trim()] : [],
      body: pdfText || '',
      isPdf: !!pdfFile,
      pdfArrayBuffer: pdfBuffer ?? null,
    });
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    fontSize: 13,
    color: C.text,
    background: C.surfaceHigh,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    color: C.muted,
    marginBottom: 5,
    fontWeight: 500,
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 28,
        width: 460,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 22 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: C.text, flex: 1, fontFamily: "'Playfair Display', serif" }}>
            Add Document
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: C.muted }}>
            ✕
          </button>
        </div>

        {/* PDF drop zone */}
        {pdfFile ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: C.amberBg, border: `1px solid ${C.amber}33`,
            borderRadius: 8, padding: '10px 14px', marginBottom: 18,
          }}>
            <span style={{ fontSize: 18 }}>📄</span>
            <span style={{ fontSize: 13, color: C.amber, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {pdfFile.name}
            </span>
            <button
              onClick={() => { setPdfFile(null); setPdfBuffer(null); setPdfText(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: C.muted }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); processPdf(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? C.amber : C.border}`,
              borderRadius: 8, padding: '16px 20px', textAlign: 'center',
              cursor: busy ? 'default' : 'pointer',
              background: dragOver ? C.amberBg : C.surfaceHigh,
              transition: 'all 0.15s', marginBottom: 18,
            }}
          >
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
              📎 Drop a PDF or{' '}
              <span style={{ color: C.amber, fontWeight: 600 }}>browse</span>
              <span style={{ color: C.muted }}> — optional</span>
            </p>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={(e) => processPdf(e.target.files[0])} />

        {/* Progress */}
        {busy && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: C.border, borderRadius: 4, height: 4, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: C.amber, borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
            <p style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 5 }}>{status}</p>
          </div>
        )}
        {status && !busy && (
          <p style={{ fontSize: 12, color: C.danger, textAlign: 'center', marginBottom: 14 }}>{status}</p>
        )}

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>Document Name *</label>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreate()} placeholder="Title" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Category</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Year</label>
              <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Document Type</label>
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select type…</option>
                {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 22 }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 18px', border: `1px solid ${C.border}`, borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 13, color: C.muted }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || busy}
            style={{
              padding: '8px 18px', border: 'none', borderRadius: 6,
              background: title.trim() && !busy ? C.amber : '#6B5A1E',
              color: title.trim() && !busy ? '#0D1117' : '#4A3F1A',
              cursor: title.trim() && !busy ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 700,
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
