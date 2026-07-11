import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminGet, adminSend } from "../lib/adminApi.js";
import { useToast } from "../components/Toast.jsx";
import { Field, Input, Textarea, NumberInput } from "../components/FormField.jsx";
import { StatusSelect } from "../components/StatusField.jsx";
import { ArrayField } from "../components/ArrayField.jsx";
import { SaveBar } from "../components/SaveBar.jsx";
import { Spinner, ErrorState } from "../../components/ui/index.jsx";

const EMPTY = {
  name: "",
  description: "",
  teachers: [],
  phones: [],
  email: "",
  order: "",
  status: "published",
};

export default function ServiceForm() {
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
    adminGet(`/admin/services/${id}`)
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
      const payload = { ...form };
      if (form.order === "") delete payload.order;
      else payload.order = Math.max(0, Number(form.order) || 0);
      if (isNew) {
        await adminSend("POST", "/admin/services", payload);
        toast.success("Service created");
      } else {
        await adminSend("PUT", `/admin/services/${id}`, payload);
        toast.success("Service saved");
      }
      navigate("/admin/services");
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
      <h1 className="text-2xl font-semibold text-ink">{isNew ? "New service" : "Edit service"}</h1>

      <div className="mt-6 space-y-5 rounded-2xl border border-cream-200 bg-white p-6 shadow-soft">
        <Field label="Name">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <ArrayField label="Teachers" value={form.teachers} onChange={(v) => set("teachers", v)} addLabel="Add teacher" />
        <ArrayField label="Phones" value={form.phones} onChange={(v) => set("phones", v)} addLabel="Add phone" />
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Order" hint="Leave blank to add at the end.">
            <NumberInput
              min="0"
              value={form.order}
              onChange={(e) => set("order", e.target.value === "" ? "" : Math.max(0, Number(e.target.value) || 0))}
              placeholder="Auto (added last)"
            />
          </Field>
          <Field label="Status">
            <StatusSelect value={form.status} onChange={(v) => set("status", v)} />
          </Field>
        </div>
      </div>

      <SaveBar saving={saving} error={saveError} onCancel={() => navigate("/admin/services")} />
    </form>
  );
}
