import { ApiError } from '../middleware/error.js';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trim + length-limit a string field. Non-strings become ''. */
export const str = (value, max = 200) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Collect field errors and throw a single 400 with details. */
export function assertValid(errors) {
  const list = Object.entries(errors).filter(([, msg]) => msg);
  if (list.length) {
    throw new ApiError(
      400,
      'Please check the highlighted fields.',
      list.map(([field, msg]) => ({ field, message: msg }))
    );
  }
}

/** Accept an array or a comma/newline separated string and return a clean string array. */
export function toList(value) {
  const arr = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[\n,]/) : [];
  return arr.map((v) => String(v).trim()).filter(Boolean);
}
