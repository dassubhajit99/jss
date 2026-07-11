import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminGet, adminSend } from "../lib/adminApi.js";
import { useToast } from "../components/Toast.jsx";
import { Field, Input, Textarea, NumberInput } from "../components/FormField.jsx";
import { StatusSelect } from "../components/StatusField.jsx";
import { ImageUpload } from "../components/ImageUpload.jsx";
import { RichTextEditor } from "../components/RichTextEditor.jsx";
import { SaveBar } from "../components/SaveBar.jsx";
import { Spinner, ErrorState } from "../../components/ui/index.jsx";

const EMPTY = {
  slug: "",
  title: "",
  subtitle: "",
  bodyHtml: "",
  heroImage: "",
  seo: { title: "", description: "", ogImage: "" },
  order: "",
  status: "published",
};

export default function PageForm() {
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
    adminGet(`/admin/pages/${id}`)
      .then((doc) => active && setForm({ ...EMPTY, ...doc, seo: { ...EMPTY.seo, ...doc.seo } }))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isNew]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function setSeo(field, value) {
    setForm((f) => ({ ...f, seo: { ...f.seo, [field]: value } }));
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
        await adminSend("POST", "/admin/pages", payload);
        toast.success("Page created");
      } else {
        await adminSend("PUT", `/admin/pages/${id}`, payload);
        toast.success("Page saved");
      }
      navigate("/admin/pages");
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
      <h1 className="text-2xl font-semibold text-ink">{isNew ? "New page" : "Edit page"}</h1>

      <div className="mt-6 space-y-5 rounded-2xl border border-cream-200 bg-white p-6 shadow-soft">
        <Field label="Slug" hint={!isNew ? "Slugs are locked after creation (public routes depend on them)." : "Lowercase letters, numbers, hyphens."}>
          <Input
            value={form.slug}
            disabled={!isNew}
            onChange={(e) => set("slug", e.target.value)}
            required
          />
        </Field>
        <Field label="Title">
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
        </Field>
        <Field label="Subtitle">
          <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
        </Field>
        <ImageUpload label="Hero image" value={form.heroImage} onChange={(v) => set("heroImage", v)} />
        <RichTextEditor label="Body" value={form.bodyHtml} onChange={(v) => set("bodyHtml", v)} />

        <div className="border-t border-cream-200 pt-5">
          <p className="mb-3 text-sm font-semibold text-ink">SEO</p>
          <div className="space-y-4">
            <Field label="SEO title">
              <Input value={form.seo.title} onChange={(e) => setSeo("title", e.target.value)} />
            </Field>
            <Field label="SEO description">
              <Textarea rows={2} value={form.seo.description} onChange={(e) => setSeo("description", e.target.value)} />
            </Field>
            <ImageUpload label="OG image" value={form.seo.ogImage} onChange={(v) => setSeo("ogImage", v)} />
          </div>
        </div>

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

      <SaveBar saving={saving} error={saveError} onCancel={() => navigate("/admin/pages")} />
    </form>
  );
}
