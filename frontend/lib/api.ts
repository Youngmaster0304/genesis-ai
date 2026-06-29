const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000') + '/api';

export async function submitIdea(idea: string, files: File[]): Promise<string> {
  const formData = new FormData();
  formData.append('idea', idea);
  
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to start innovation analysis pipeline.');
  }

  const data = await response.json();
  return data.session_id;
}

export async function getReport(sessionId: string) {
  const response = await fetch(`${API_BASE}/session/${sessionId}/report`);
  if (!response.ok) {
    throw new Error('Report is not ready yet or does not exist.');
  }
  return response.json();
}

export async function getMarkdownExport(sessionId: string): Promise<string> {
  const response = await fetch(`${API_BASE}/session/${sessionId}/export/md`);
  if (!response.ok) {
    throw new Error('Failed to load markdown export.');
  }
  const data = await response.json();
  return data.markdown;
}
export async function downloadPptx(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/session/${sessionId}/export/pptx`);
  if (!response.ok) {
    throw new Error('Failed to generate pitch deck. Please try again.');
  }
  // Stream binary blob and trigger browser download
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `genesis-pitch-deck-${sessionId.slice(0, 8)}.pptx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
