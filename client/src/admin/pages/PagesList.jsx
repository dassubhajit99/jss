import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminFetch } from "../hooks/useAdminFetch.js";
import { adminSend } from "../lib/adminApi.js";
import { useToast } from "../components/Toast.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { StatusBadge } from "../components/StatusField.jsx";
import { Spinner, ErrorState } from "../../components/ui/index.jsx";

export default function PagesList() {
  const { data, loading, error, refetch } = useAdminFetch("/admin/pages");
  const navigate = useNavigate();
  const toast = useToast();
  const [toDelete, setToDelete] = useState(null);

  async function handleDelete() {
    try {
      await adminSend("DELETE", `/admin/pages/${toDelete._id}`);
      toast.success("Page deleted");
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Pages</h1>
        <button
          onClick={() => navigate("/admin/pages/new")}
          className="rounded-xl bg-maroon px-4 py-2 text-sm font-semibold text-white hover:bg-maroon-700"
        >
          New page
        </button>
      </div>

      <div className="mt-6">
        <DataTable
          rowKey="_id"
          rows={data}
          onRowClick={(row) => navigate(`/admin/pages/${row._id}`)}
          empty="No pages yet."
          columns={[
            { key: "title", label: "Title" },
            { key: "slug", label: "Slug" },
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            {
              key: "updatedAt",
              label: "Updated",
              render: (r) => (r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : "—"),
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
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this page?"
        message={toDelete ? `"${toDelete.title}" will be permanently removed.` : ""}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
