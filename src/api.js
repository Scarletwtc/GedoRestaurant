// Small helper to build API URLs correctly in dev/prod
// - In dev, Vite proxy handles /api → http://localhost:5000
// - In prod (Firebase Hosting), backend should be wired via rewrites or a full URL can be used
export function apiUrl(path) {
  const input = path || '/';
  if (input.startsWith('http')) return input;
  const base = import.meta.env?.VITE_API_BASE_URL || 'https://gedo-server-294732304552.us-central1.run.app';
  const normalizedPath = input.startsWith('/') ? input : `/${input}`;
  if (!base) return normalizedPath; // dev: let Vite proxy handle /api
  const trimmed = base.replace(/\/$/, '');
  return `${trimmed}${normalizedPath}`;
}

// Helper to get full image URL
export function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's a relative path, prepend the server URL
  const base = import.meta.env?.VITE_API_BASE_URL || 'https://gedo-server-294732304552.us-central1.run.app';
  const trimmed = base.replace(/\/$/, '');
  return `${trimmed}${imagePath}`;
}

