import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

function toRow(note) {
  return {
    id:            note.id,
    title:         note.title,
    body:          note.body ?? '',
    module:        note.module ?? null,
    subject:       note.subject ?? null,
    document_type: note.documentType ?? null,
    year:          note.year ?? null,
    uploaded_by:   note.uploadedBy ?? null,
    tags:          note.tags ?? [],
    pinned:        note.pinned ?? false,
    created:       note.created ?? null,
    is_pdf:        note.isPdf ?? false,
    pdf_path:      note.pdfPath ?? null,
  };
}

function fromRow(row) {
  return {
    id:              row.id,
    title:           row.title,
    body:            row.body ?? '',
    module:          row.module,
    subject:         row.subject,
    documentType:    row.document_type,
    year:            row.year,
    uploadedBy:      row.uploaded_by,
    tags:            row.tags ?? [],
    pinned:          row.pinned ?? false,
    created:         row.created,
    isPdf:           row.is_pdf ?? false,
    pdfPath:         row.pdf_path ?? null,
    pdfArrayBuffer:  null, // loaded separately via Storage
  };
}

export async function getAllNotes() {
  const { data, error } = await supabase.from('notes').select('*').order('created', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function putNote(note) {
  const { error } = await supabase.from('notes').upsert(toRow(note));
  if (error) throw error;
}

export async function removeNote(id) {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}

// Upload a PDF and return its storage path
export async function uploadPdf(id, arrayBuffer) {
  const path = `${id}.pdf`;
  const { error } = await supabase.storage
    .from('pdfs')
    .upload(path, arrayBuffer, { contentType: 'application/pdf', upsert: true });
  if (error) throw error;
  return path;
}

// Get a short-lived signed URL to download a PDF
export async function getPdfUrl(path) {
  const { data, error } = await supabase.storage
    .from('pdfs')
    .createSignedUrl(path, 60 * 60); // 1 hour
  if (error) throw error;
  return data.signedUrl;
}
