export function sanitizePath(path: string): string {
  return path.replace(/\0/g, '').trim();
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function sanitizeGitRef(ref: string): string {
  return ref.replace(/[^a-zA-Z0-9._\/-]/g, '');
}