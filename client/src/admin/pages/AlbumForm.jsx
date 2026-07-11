import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminGet, adminSend } from "../lib/adminApi.js";
import { useToast } from "../components/Toast.jsx";
import { Field, Input, NumberInput, Select } from "../components/FormField.jsx";
import { StatusSelect } from "../components/StatusField.jsx";
import { ImageUpload } from "../components/ImageUpload.jsx";
import { ImagesField } from "../components/ImagesField.jsx";
import { SaveBar } from "../components/SaveBar.jsx";
import { Spinner, ErrorState } from "../../components/ui/index.jsx";

const EMPTY = {
  slug: "",
  title: "",
  category: "activities",
  year: "",
  coverImage: "",
  images: [],
  order: "",
  status: "published",
};

export default function AlbumForm() {
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
    adminGet(`/admin/gallery/${id}`)
      .then((doc) => active && setForm({ ...EMPTY, ...doc, year: doc.year ?? "" }))
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
      const payload = {
        ...form,
        year: form.year === "" ? null : Number(form.year),
      };
      if (form.order === "") delete payload.order;
      else payload.order = Math.max(0, Number(form.order) || 0);
      if (isNew) {
        await adminSend("POST", "/admin/gallery", payload);
        toast.success("Album created");
      } else {
        await adminSend("PUT", `/admin/gallery/${id}`, payload);
        toast.success("Album saved");
      }
      navigate("/admin/gallery");
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
      <h1 className="text-2xl font-semibold text-ink">{isNew ? "New album" : "Edit album"}</h1>

      <div className="mt-6 space-y-5 rounded-2xl border border-cream-200 bg-white p-6 shadow-soft">
        <Field label="Slug" hint={!isNew ? "Slugs are locked after creation." : "Lowercase letters, numbers, hyphens."}>
          <Input value={form.slug} disabled={!isNew} onChange={(e) => set("slug", e.target.value)} required />
        </Field>
        <Field label="Title">
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="activities">Activities</option>
              <option value="durgapuja">Durga Puja</option>
            </Select>
          </Field>
          <Field label="Year">
            <NumberInput value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="Optional" />
          </Field>
        </div>
        <ImageUpload label="Cover image" value={form.coverImage} onChange={(v) => set("coverImage", v)} />
        <ImagesField label="Images" mode="objects" value={form.images} onChange={(v) => set("images", v)} />
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

      <SaveBar saving={saving} error={saveError} onCancel={() => navigate("/admin/gallery")} />
    </form>
  );
}
