import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminFetch } from "../hooks/useAdminFetch.js";
import { useListControls } from "../hooks/useListControls.js";
import { adminSend } from "../lib/adminApi.js";
import { useToast } from "../components/Toast.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { StatusBadge } from "../components/StatusField.jsx";
import { SearchInput } from "../components/SearchInput.jsx";
import { Pagination } from "../components/Pagination.jsx";
import { Spinner, ErrorState } from "../../components/ui/index.jsx";

export default function PressList() {
  const { data, loading, error, refetch } = useAdminFetch("/admin/press");
  const navigate = useNavigate();
  const toast = useToast();
  const [toDelete, setToDelete] = useState(null);
  const { query, setQuery, pageRows, page, setPage, totalPages, total, filteredTotal, isFiltering } =
    useListControls(data || [], { searchKeys: ["title", "publication"], pageSize: 20 });

  async function handleDelete() {
    try {
      await adminSend("DELETE", `/admin/press/${toDelete._id}`);
      toast.success("Press item deleted");
      setToDelete(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-ink">Press</h1>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <SearchInput value={query} onChange={setQuery} placeholder="Search press…" />
          <button
            onClick={() => navigate("/admin/press/new")}
            className="shrink-0 whitespace-nowrap rounded-xl bg-maroon px-4 py-2 text-sm font-semibold text-white hover:bg-maroon-700"
          >
            New press item
          </button>
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          rowKey="_id"
          rows={pageRows}
          onRowClick={(row) => navigate(`/admin/press/${row._id}`)}
          empty="No press items match your search."
          columns={[
            { key: "title", label: "Title" },
            { key: "publication", label: "Publication" },
            {
              key: "date",
              label: "Date",
              render: (r) => (r.date ? new Date(r.date).toLocaleDateString() : "—"),
            },
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
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
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-ink-700/70">
        <span>
          Showing {pageRows.length} of {filteredTotal}
          {isFiltering ? ` (filtered from ${total})` : ""}
        </span>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this press item?"
        message={toDelete ? `"${toDelete.title}" will be permanently removed.` : ""}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
