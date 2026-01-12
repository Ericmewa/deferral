export function getFullUrl(url) {
  if (!url) return null;
  // If already absolute or data/blob, return as-is
  if (/^(https?:)?\/\//i.test(url) || /^data:|^blob:/i.test(url)) return url;
  // For root-relative URLs like /uploads/..., prefix API base
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (url.startsWith('/')) return (base ? base : '') + url;
  return url;
}

export function openFileInNewTab(url) {
  const full = getFullUrl(url);
  if (!full) return;
  window.open(full, '_blank');
}

export function downloadFile(url, filename) {
  const full = getFullUrl(url);
  if (!full) return;
  const link = document.createElement('a');
  link.href = full;
  if (filename) link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
