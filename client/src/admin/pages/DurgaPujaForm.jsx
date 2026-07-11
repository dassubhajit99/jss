import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminGet, adminSend } from "../lib/adminApi.js";
import { useToast } from "../components/Toast.jsx";
import { Field, Input, Textarea, NumberInput } from "../components/FormField.jsx";
import { StatusSelect } from "../components/StatusField.jsx";
import { ImageUpload } from "../components/ImageUpload.jsx";
import { ImagesField } from "../components/ImagesField.jsx";
import { ArrayField } from "../components/ArrayField.jsx";
import { SaveBar } from "../components/SaveBar.jsx";
import { Spinner, ErrorState } from "../../components/ui/index.jsx";

const EMPTY = {
  year: new Date().getFullYear(),
  theme: "",
  description: "",
  awards: [],
  coverImage: "",
  images: [],
  status: "published",
};

export default function DurgaPujaForm() {
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
    adminGet(`/admin/durga-puja/${id}`)
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
        await adminSend("POST", "/admin/durga-puja", form);
        toast.success("Entry created");
      } else {
        await adminSend("PUT", `/admin/durga-puja/${id}`, form);
        toast.success("Entry saved");
      }
      navigate("/admin/durga-puja");
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
      <h1 className="text-2xl font-semibold text-ink">{isNew ? "New Durga Puja entry" : "Edit Durga Puja entry"}</h1>

      <div className="mt-6 space-y-5 rounded-2xl border border-cream-200 bg-white p-6 shadow-soft">
        <Field label="Year">
          <NumberInput value={form.year} onChange={(e) => set("year", Number(e.target.value))} required />
        </Field>
        <Field label="Theme">
          <Input value={form.theme} onChange={(e) => set("theme", e.target.value)} />
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <ArrayField
          label="Awards"
          value={form.awards}
          onChange={(v) => set("awards", v)}
          newItem={() => ""}
          addLabel="Add award"
        />
        <ImageUpload label="Cover image" value={form.coverImage} onChange={(v) => set("coverImage", v)} />
        <ImagesField label="Images" mode="strings" value={form.images} onChange={(v) => set("images", v)} />
        <Field label="Status">
          <StatusSelect value={form.status} onChange={(v) => set("status", v)} />
        </Field>
      </div>

      <SaveBar saving={saving} error={saveError} onCancel={() => navigate("/admin/durga-puja")} />
    </form>
  );
}
