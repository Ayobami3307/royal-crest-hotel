const BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'rc_admin_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable: the session simply will not survive a refresh */
  }
};
export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

export class ApiError extends Error {
  constructor(message, status = 0, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
  /** Map server field errors ([{field, message}]) to { field: message } for forms. */
  get fieldErrors() {
    if (!Array.isArray(this.details)) return {};
    return Object.fromEntries(this.details.filter((d) => d && d.field).map((d) => [d.field, d.message]));
  }
}

let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

async function request(method, path, { body, params, auth = false } = {}) {
  const query = params
    ? Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    : [];
  const qs = query.length ? `?${new URLSearchParams(query)}` : '';

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE}${path}${qs}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('We could not reach the server. Please check your connection and try again.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) {
    if (res.status === 401 && auth && unauthorizedHandler) unauthorizedHandler();
    throw new ApiError(data?.message || 'Something went wrong. Please try again.', res.status, data?.details);
  }
  return data;
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, opts) => request('POST', path, opts),
  put: (path, opts) => request('PUT', path, opts),
  patch: (path, opts) => request('PATCH', path, opts),
  del: (path, opts) => request('DELETE', path, opts),
};
