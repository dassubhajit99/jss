import { useCallback, useEffect, useState } from "react";
import { adminGet } from "../lib/adminApi.js";

// Same contract as the public useFetch({data, loading, error}) but authed,
// and exposes refetch() so lists can reload after delete/reorder.
export function useAdminFetch(path) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  const load = useCallback(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    adminGet(path)
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }));
    return () => {
      active = false;
    };
  }, [path]);

  useEffect(() => load(), [load, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { ...state, refetch };
}
