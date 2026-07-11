import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminFetch } from "../hooks/useAdminFetch.js";
import { adminSend } from "../lib/adminApi.js";
import { useToast } from "../components/Toast.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { StatusBadge } from "../components/StatusField.jsx";
import { Spinner, ErrorState } from "../../components/ui/index.jsx";

export default function ServicesList() {
  const { data, loading, error, refetch } = useAdminFetch("/admin/services");
  const navigate = useNavigate();
  const toast = useToast();
  const [toDelete, setToDelete] = useState(null);

  async function handleDelete() {
    try {
      await adminSend("DELETE", `/admin/services/${toDelete._id}`);
      toast.success("Service deleted");
      setToDelete(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  }

  async function move(idx, dir) {
    const target = idx + dir;
    if (!data || target < 0 || target >= data.length) return;
    const ids = data.map((r) => r._id);
    [ids[idx], ids[target]] = [ids[target], ids[idx]];
    try {
      await adminSend("POST", "/admin/services/reorder", { ids });
      refetch();
    } catch (err) {
      toast.error(err.message || "Reorder failed");
    }
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Services</h1>
        <button
          onClick={() => navigate("/admin/services/new")}
          className="rounded-xl bg-maroon px-4 py-2 text-sm font-semibold text-white hover:bg-maroon-700"
        >
          New service
        </button>
      </div>

      <div className="mt-6">
        <DataTable
          rowKey="_id"
          rows={data}
          onRowClick={(row) => navigate(`/admin/services/${row._id}`)}
          empty="No services yet."
          columns={[
            {
              key: "order",
              label: "Order",
              render: (r) => {
                const idx = data.findIndex((x) => x._id === r._id);
                return (
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      className="rounded px-1.5 py-0.5 text-ink-700 hover:bg-cream-200 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      disabled={idx === data.length - 1}
                      className="rounded px-1.5 py-0.5 text-ink-700 hover:bg-cream-200 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                );
              },
            },
            { key: "name", label: "Name" },
            { key: "phones", label: "Phones", render: (r) => (r.phones || []).join(", ") || "—" },
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

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this service?"
        message={toDelete ? `"${toDelete.name}" will be permanently removed.` : ""}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
