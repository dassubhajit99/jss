import { useEffect, useState } from "react";
import { getData } from "../lib/api.js";

// Fetches `path` and unwraps { data }. Re-runs when `path` changes.
export function useFetch(path) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: null });
    getData(path)
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }));
    return () => {
      active = false;
    };
  }, [path]);

  return state;
}
