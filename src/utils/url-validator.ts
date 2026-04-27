import { URL } from 'url';

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUrl(urlString: string): UrlValidationResult {
  try {
    const url = new URL(urlString);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }

    // Block localhost and private IPs in production
    const hostname = url.hostname.toLowerCase();
    if (isLocalhost(hostname) || isPrivateIp(hostname)) {
      return { valid: false, error: 'Localhost and private IPs are not allowed' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

function isLocalhost(hostname: string): boolean {
  return ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname);
}

function isPrivateIp(hostname: string): boolean {
  // Simple check for common private IP ranges
  const privatePatterns = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./, // Link-local
  ];

  return privatePatterns.some(pattern => pattern.test(hostname));
}

export function matchesWildcard(pattern: string, hostname: string): boolean {
  // Convert wildcard pattern to regex
  // e.g., *.example.com matches sub.example.com
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars except *
    .replace(/\*/g, '.*'); // Convert * to .*

  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(hostname);
}

export function isValidUrlPattern(pattern: string): boolean {
  try {
    new URL(pattern);
    return true;
  } catch {
    // If it can't be parsed as URL, check if it's a valid wildcard pattern
    return pattern.includes('*');
  }
}