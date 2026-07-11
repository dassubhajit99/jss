import { useMemo, useState } from "react";
import { useFetch } from "../../hooks/useFetch.js";
import { Spinner, ErrorState, EmptyState } from "../ui/index.jsx";
import { MemberCard } from "./MemberCard.jsx";

const PAGE_SIZE = 12;

const inputCls =
  "w-full rounded-xl border-cream-200 bg-white text-ink shadow-sm focus:border-maroon focus:ring-maroon";

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-xl border border-cream-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>
      <span className="text-sm text-ink-700">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-xl border border-cream-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

function MemberGrid({ members }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {members.map((m) => (
        <MemberCard key={m._id} name={m.name} role={m.role} photo={m.photo} />
      ))}
    </div>
  );
}

export function MembersDirectory() {
  const { data: members, loading, error } = useFetch("/committee");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!members) return [];
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.name?.toLowerCase().includes(q));
  }, [members, search]);

  const officeBearers = useMemo(() => (members || []).filter((m) => !m.isExecutive), [members]);
  const committeeMembers = useMemo(() => (members || []).filter((m) => m.isExecutive), [members]);

  const isSearching = search.trim().length > 0;

  const committeeTotalPages = Math.max(1, Math.ceil(committeeMembers.length / PAGE_SIZE));
  const committeePage = committeeMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resultsTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const resultsPage = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function onSearchChange(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  return (
    <div>
      <label className="block">
        <span className="sr-only">Search members by name</span>
        <input
          type="search"
          value={search}
          onChange={onSearchChange}
          placeholder="Search members by name…"
          className={inputCls}
        />
      </label>

      <div className="mt-8">
        {loading && <Spinner />}
        {error && <ErrorState error={error} />}
        {members && members.length === 0 && <EmptyState title="No members yet" />}

        {members && members.length > 0 && !isSearching && (
          <>
            {officeBearers.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold text-maroon">Office Bearers</h2>
                <div className="mt-5">
                  <MemberGrid members={officeBearers} />
                </div>
              </section>
            )}

            {committeeMembers.length > 0 && (
              <section className="mt-12">
                <h2 className="font-display text-2xl font-bold text-maroon">Committee Members</h2>
                <div className="mt-5">
                  <MemberGrid members={committeePage} />
                  <Pagination page={page} totalPages={committeeTotalPages} onChange={setPage} />
                </div>
              </section>
            )}
          </>
        )}

        {members && members.length > 0 && isSearching && (
          <section>
            <h2 className="font-display text-2xl font-bold text-maroon">Results ({filtered.length})</h2>
            {filtered.length === 0 ? (
              <div className="mt-5">
                <EmptyState title="No members found" message="Try a different name." />
              </div>
            ) : (
              <div className="mt-5">
                <MemberGrid members={resultsPage} />
                <Pagination page={page} totalPages={resultsTotalPages} onChange={setPage} />
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
