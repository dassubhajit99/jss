import { useEffect, useMemo, useState } from "react";

// Shared client-side search + pagination for admin list pages.
// Usage: const { query, setQuery, pageRows, page, setPage, totalPages, total, filteredTotal, isFiltering }
//   = useListControls(data, { searchKeys: ["name", "role"], pageSize: 20 });
export function useListControls(rows, { searchKeys = [], pageSize = 20 } = {}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const safeRows = rows || [];
  const total = safeRows.length;

  const trimmed = query.trim().toLowerCase();
  const isFiltering = trimmed !== "";
  const keysDep = searchKeys.join("|");

  const filtered = useMemo(() => {
    if (!isFiltering) return safeRows;
    return safeRows.filter((row) =>
      searchKeys.some((key) => {
        const value = row?.[key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(trimmed);
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeRows, trimmed, keysDep]);

  const filteredTotal = filtered.length;
  const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize));

  // Reset to page 1 whenever the search query changes.
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed]);

  // Clamp page into range if the result set shrinks (e.g. after delete/filter).
  useEffect(() => {
    setPage((p) => Math.min(Math.max(p, 1), totalPages));
  }, [totalPages]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return {
    query,
    setQuery,
    pageRows,
    page,
    setPage,
    totalPages,
    total,
    filteredTotal,
    isFiltering,
  };
}
