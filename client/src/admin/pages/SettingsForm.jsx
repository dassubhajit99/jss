import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminGet, adminSend } from "../lib/adminApi.js";
import { useToast } from "../components/Toast.jsx";
import { Field, Input, Textarea, NumberInput } from "../components/FormField.jsx";
import { ImageUpload } from "../components/ImageUpload.jsx";
import { ArrayField } from "../components/ArrayField.jsx";
import { SaveBar } from "../components/SaveBar.jsx";
import { Spinner, ErrorState } from "../../components/ui/index.jsx";

const EMPTY = {
  clubName: "",
  tagline: "",
  foundedYear: "",
  address: "",
  email: "",
  website: "",
  socials: { facebook: "", instagram: "", youtube: "" },
  hero: { slides: [] },
  stats: [],
};

export default function SettingsForm() {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let active = true;
    adminGet("/admin/settings")
      .then((doc) =>
        active &&
        setForm({
          ...EMPTY,
          ...doc,
          socials: { ...EMPTY.socials, ...doc?.socials },
          hero: { slides: doc?.hero?.slides || [] },
          stats: doc?.stats || [],
        })
      )
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function setSocial(field, value) {
    setForm((f) => ({ ...f, socials: { ...f.socials, [field]: value } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const payload = { ...form, foundedYear: form.foundedYear === "" ? undefined : Number(form.foundedYear) };
      await adminSend("PUT", "/admin/settings", payload);
      toast.success("Settings saved");
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
      <h1 className="text-2xl font-semibold text-ink">Site Settings</h1>

      <div className="mt-6 space-y-5 rounded-2xl border border-cream-200 bg-white p-6 shadow-soft">
        <Field label="Club name">
          <Input value={form.clubName} onChange={(e) => set("clubName", e.target.value)} />
        </Field>
        <Field label="Tagline">
          <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Founded year">
            <NumberInput value={form.foundedYear} onChange={(e) => set("foundedYear", e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
        </div>
        <Field label="Address">
          <Textarea rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
        <Field label="Website">
          <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
        </Field>

        <div className="border-t border-cream-200 pt-5">
          <p className="mb-3 text-sm font-semibold text-ink">Social links</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Facebook">
              <Input value={form.socials.facebook} onChange={(e) => setSocial("facebook", e.target.value)} />
            </Field>
            <Field label="Instagram">
              <Input value={form.socials.instagram} onChange={(e) => setSocial("instagram", e.target.value)} />
            </Field>
            <Field label="YouTube">
              <Input value={form.socials.youtube} onChange={(e) => setSocial("youtube", e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="border-t border-cream-200 pt-5">
          <p className="mb-3 text-sm font-semibold text-ink">Hero slides</p>
          <ArrayField
            value={form.hero.slides}
            onChange={(slides) => set("hero", { slides })}
            addLabel="Add slide"
            newItem={() => ({ image: "", headline: "", subtext: "", ctaLabel: "", ctaHref: "" })}
            renderRow={(slide, update) => (
              <div className="space-y-3">
                <ImageUpload
                  label="Image"
                  value={slide.image}
                  onChange={(v) => update({ ...slide, image: v })}
                />
                <Field label="Headline">
                  <Input value={slide.headline} onChange={(e) => update({ ...slide, headline: e.target.value })} />
                </Field>
                <Field label="Subtext">
                  <Input value={slide.subtext} onChange={(e) => update({ ...slide, subtext: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="CTA label">
                    <Input value={slide.ctaLabel} onChange={(e) => update({ ...slide, ctaLabel: e.target.value })} />
                  </Field>
                  <Field label="CTA link">
                    <Input value={slide.ctaHref} onChange={(e) => update({ ...slide, ctaHref: e.target.value })} />
                  </Field>
                </div>
              </div>
            )}
          />
        </div>

        <div className="border-t border-cream-200 pt-5">
          <p className="mb-3 text-sm font-semibold text-ink">Stats</p>
          <ArrayField
            value={form.stats}
            onChange={(v) => set("stats", v)}
            addLabel="Add stat"
            newItem={() => ({ label: "", value: "" })}
            renderRow={(stat, update) => (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Label">
                  <Input value={stat.label} onChange={(e) => update({ ...stat, label: e.target.value })} />
                </Field>
                <Field label="Value">
                  <Input value={stat.value} onChange={(e) => update({ ...stat, value: e.target.value })} />
                </Field>
              </div>
            )}
          />
        </div>
      </div>

      <SaveBar saving={saving} error={saveError} onCancel={() => navigate("/admin")} />
    </form>
  );
}
