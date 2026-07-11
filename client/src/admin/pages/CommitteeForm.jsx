import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminGet, adminSend } from "../lib/adminApi.js";
import { useToast } from "../components/Toast.jsx";
import { Field, Input, NumberInput, Checkbox } from "../components/FormField.jsx";
import { StatusSelect } from "../components/StatusField.jsx";
import { ImageUpload } from "../components/ImageUpload.jsx";
import { SaveBar } from "../components/SaveBar.jsx";
import { Spinner, ErrorState } from "../../components/ui/index.jsx";

const EMPTY = { name: "", role: "", isExecutive: false, order: 0, photo: "", status: "published" };

export default function CommitteeForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (isNew) return;
    let active = true;
    adminGet(`/admin/committee/${id}`)
      .then((doc) => active && setForm({ ...EMPTY, ...doc }))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isNew]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      if (isNew) {
        await adminSend("POST", "/admin/committee", form);
        toast.success("Committee member created");
      } else {
        await adminSend("PUT", `/admin/committee/${id}`, form);
        toast.success("Committee member saved");
      }
      navigate("/admin/committee");
    } catch (err) {
      setSaveError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold text-ink">{isNew ? "New committee member" : "Edit committee member"}</h1>

      <div className="mt-6 space-y-5 rounded-2xl border border-cream-200 bg-white p-6 shadow-soft">
        <Field label="Name">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </Field>
        <Field label="Role">
          <Input value={form.role} onChange={(e) => set("role", e.target.value)} required />
        </Field>
        <Checkbox
          label="Executive member"
          checked={form.isExecutive}
          onChange={(e) => set("isExecutive", e.target.checked)}
        />
        <ImageUpload label="Photo" value={form.photo} onChange={(v) => set("photo", v)} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Order">
            <NumberInput value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
          </Field>
          <Field label="Status">
            <StatusSelect value={form.status} onChange={(v) => set("status", v)} />
          </Field>
        </div>
      </div>

      <SaveBar saving={saving} error={saveError} onCancel={() => navigate("/admin/committee")} />
    </form>
  );
}
