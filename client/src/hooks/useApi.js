import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

/**
 * GET a resource with loading + error state.
 *   const { data, loading, error, reload } = useApi('/room-types', { params: { featured: true } });
 * Stale responses (from a previous params value or an unmounted component) are ignored.
 */
export function useApi(path, { params, enabled = true, auth = false } = {}) {
  const [state, setState] = useState({ data: null, loading: enabled, error: null });
  const paramsKey = JSON.stringify(params || {});
  const seq = useRef(0);

  const load = useCallback(async () => {
    if (!enabled) return;
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api.get(path, { params: JSON.parse(paramsKey), auth });
      if (id === seq.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === seq.current) setState((s) => ({ data: s.data, loading: false, error }));
    }
  }, [path, paramsKey, enabled, auth]);

  useEffect(() => {
    load();
    return () => {
      seq.current += 1;
    };
  }, [load]);

  return { ...state, reload: load };
}
