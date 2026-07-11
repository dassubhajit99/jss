const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export async function api(path, opts = {}) {
  const { headers, ...rest } = opts;
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    ...rest,
  });
  let body = null;
  let parsed = false;
  try {
    body = await res.json();
    parsed = true;
  } catch {
    /* no body */
  }
  if (!res.ok) {
    const msg = body?.error?.message || res.statusText || "Request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.code = body?.error?.code;
    throw err;
  }
  if (!parsed) {
    throw new Error(
      "Expected JSON from API but got a non-JSON response. Check that the API is running and VITE_API_BASE_URL / the dev proxy points to it."
    );
  }
  return body;
}

// Convenience GET that unwraps { data }.
export async function getData(path) {
  const body = await api(path);
  return body?.data;
}
