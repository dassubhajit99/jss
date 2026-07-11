import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminGet, adminSend } from "../lib/adminApi.js";
import { useToast } from "../components/Toast.jsx";
import { Field, Input, Textarea } from "../components/FormField.jsx";
import { StatusSelect } from "../components/StatusField.jsx";
import { ImageUpload } from "../components/ImageUpload.jsx";
import { SaveBar } from "../components/SaveBar.jsx";
import { Spinner, ErrorState } from "../../components/ui/index.jsx";

const EMPTY = { title: "", publication: "", date: "", excerpt: "", link: "", image: "", status: "published" };

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function PressForm() {
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
    adminGet(`/admin/press/${id}`)
      .then((doc) => active && setForm({ ...EMPTY, ...doc, date: toDateInput(doc.date) }))
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
      const payload = { ...form, date: form.date || null };
      if (isNew) {
        await adminSend("POST", "/admin/press", payload);
        toast.success("Press item created");
      } else {
        await adminSend("PUT", `/admin/press/${id}`, payload);
        toast.success("Press item saved");
      }
      navigate("/admin/press");
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
      <h1 className="text-2xl font-semibold text-ink">{isNew ? "New press item" : "Edit press item"}</h1>

      <div className="mt-6 space-y-5 rounded-2xl border border-cream-200 bg-white p-6 shadow-soft">
        <Field label="Title">
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Publication">
            <Input value={form.publication} onChange={(e) => set("publication", e.target.value)} />
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
          </Field>
        </div>
        <Field label="Excerpt">
          <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
        </Field>
        <Field label="Link">
          <Input value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="https://" />
        </Field>
        <ImageUpload label="Image" value={form.image} onChange={(v) => set("image", v)} />
        <Field label="Status">
          <StatusSelect value={form.status} onChange={(v) => set("status", v)} />
        </Field>
      </div>

      <SaveBar saving={saving} error={saveError} onCancel={() => navigate("/admin/press")} />
    </form>
  );
}
