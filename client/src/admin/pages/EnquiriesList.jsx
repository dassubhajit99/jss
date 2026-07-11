import { useCallback, useEffect, useState } from "react";
import { adminApi, adminSend } from "../lib/adminApi.js";
import { useToast } from "../components/Toast.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { Badge, Spinner, ErrorState } from "../../components/ui/index.jsx";

const TABS = [
  { key: "", label: "All" },
  { key: "false", label: "Unhandled" },
  { key: "true", label: "Handled" },
];

export default function EnquiriesList() {
  const toast = useToast();
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(null);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (filter) params.set("handled", filter);
    adminApi(`/admin/enquiries?${params.toString()}`)
      .then((body) => {
        setRows(body.data);
        setMeta(body.meta || { total: body.data.length, page: 1, pages: 1 });
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [filter, page]);

  useEffect(() => load(), [load]);

  async function toggleHandled(row) {
    try {
      await adminSend("PATCH", `/admin/enquiries/${row._id}`, { handled: !row.handled });
      toast.success(row.handled ? "Marked unhandled" : "Marked handled");
      load();
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  }

  async function handleDelete() {
    try {
      await adminSend("DELETE", `/admin/enquiries/${toDelete._id}`);
      toast.success("Enquiry deleted");
      setToDelete(null);
      setExpanded(null);
      load();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Enquiries</h1>

      <div className="mt-4 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setFilter(tab.key);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              filter === tab.key ? "bg-maroon text-white" : "bg-white text-ink-700 hover:bg-cream-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState error={error} />
        ) : (
          <DataTable
            rowKey="_id"
            rows={rows}
            onRowClick={(row) => setExpanded(row)}
            empty="No enquiries yet."
            columns={[
              {
                key: "createdAt",
                label: "Received",
                render: (r) => new Date(r.createdAt).toLocaleString(),
              },
              { key: "type", label: "Type", render: (r) => <Badge>{r.type}</Badge> },
              { key: "name", label: "Name" },
              { key: "contact", label: "Contact", render: (r) => r.email || r.phone || "—" },
              { key: "subject", label: "Subject", render: (r) => r.subject || "—" },
              {
                key: "handled",
                label: "Status",
                render: (r) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHandled(r);
                    }}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      r.handled ? "bg-maroon/10 text-maroon" : "bg-gold-300/60 text-ink"
                    }`}
                  >
                    {r.handled ? "Handled" : "Unhandled"}
                  </button>
                ),
              },
              {
                key: "actions",
                label: "",
                render: (r) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setToDelete(r);
                    }}
                    className="text-xs font-semibold text-maroon hover:underline"
                  >
                    Delete
                  </button>
                ),
              },
            ]}
          />
        )}
      </div>

      {!loading && !error && meta.pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-700">
          <span>
            Page {meta.page} of {meta.pages} ({meta.total} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page <= 1}
              className="rounded-lg border border-cream-200 bg-white px-3 py-1.5 font-medium disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
              disabled={meta.page >= meta.pages}
              className="rounded-lg border border-cream-200 bg-white px-3 py-1.5 font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
          onClick={() => setExpanded(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-ink">{expanded.subject || expanded.name}</h3>
              <button onClick={() => setExpanded(null)} className="text-ink-700 hover:text-ink" aria-label="Close">
                ✕
              </button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Type" value={expanded.type} />
              <Row label="Name" value={expanded.name} />
              <Row label="Email" value={expanded.email} />
              <Row label="Phone" value={expanded.phone} />
              <Row
                label="Address"
                value={[expanded.city, expanded.state, expanded.zip, expanded.country].filter(Boolean).join(", ")}
              />
              <Row label="Received" value={new Date(expanded.createdAt).toLocaleString()} />
              <Row label="IP" value={expanded.meta?.ip} />
              <Row label="User agent" value={expanded.meta?.userAgent} />
            </dl>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-700">Message</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{expanded.message}</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => toggleHandled(expanded)}
                className="rounded-xl border border-maroon px-4 py-2 text-sm font-semibold text-maroon hover:bg-maroon hover:text-white"
              >
                Mark {expanded.handled ? "unhandled" : "handled"}
              </button>
              <button
                onClick={() => setToDelete(expanded)}
                className="rounded-xl bg-maroon px-4 py-2 text-sm font-semibold text-white hover:bg-maroon-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this enquiry?"
        message={toDelete ? `The enquiry from "${toDelete.name}" will be permanently removed.` : ""}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 font-semibold text-ink-700">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
