import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminGet, adminSend } from "../lib/adminApi.js";
import { useToast } from "../components/Toast.jsx";
import { Field, Input, NumberInput, Select } from "../components/FormField.jsx";
import { StatusSelect } from "../components/StatusField.jsx";
import { ImageUpload } from "../components/ImageUpload.jsx";
import { SaveBar } from "../components/SaveBar.jsx";
import { Spinner, ErrorState } from "../../components/ui/index.jsx";

const ROLES = [
  "Chief Advisor",
  "President",
  "Vice President",
  "Secretary",
  "Assistant Secretary",
  "Cashier",
  "Executive Member",
];
const OTHER = "Other…";
const OFFICE_BEARER_ROLES = ["Chief Advisor", "President", "Vice President", "Secretary", "Assistant Secretary", "Cashier"];

const EMPTY = { name: "", role: "", isExecutive: false, order: "", photo: "", status: "published" };

export default function CommitteeForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [otherRole, setOtherRole] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (isNew) return;
    let active = true;
    adminGet(`/admin/committee/${id}`)
      .then((doc) => {
        if (!active) return;
        setForm({ ...EMPTY, ...doc });
        setOtherRole(!!doc.role && !ROLES.includes(doc.role));
      })
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isNew]);

  const isCustomRole = otherRole || (!!form.role && !ROLES.includes(form.role));

  function setRole(value) {
    if (value === OTHER) {
      setOtherRole(true);
      set("role", "");
    } else {
      setOtherRole(false);
      set("role", value);
    }
  }

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
        isExecutive: !OFFICE_BEARER_ROLES.includes(form.role),
      };
      if (form.order === "") delete payload.order;
      else payload.order = Math.max(0, Number(form.order) || 0);
      if (isNew) {
        await adminSend("POST", "/admin/committee", payload);
        toast.success("Committee member created");
      } else {
        await adminSend("PUT", `/admin/committee/${id}`, payload);
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
        <Field
          label="Role"
          hint="Standard titles (President, Secretary, etc.) appear under Office Bearers; “Executive Member” or any custom role appears under Committee Members."
        >
          <Select value={isCustomRole ? OTHER : form.role} onChange={(e) => setRole(e.target.value)} required>
            <option value="" disabled>
              Select a role
            </option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
            <option value={OTHER}>{OTHER}</option>
          </Select>
          {isCustomRole && (
            <Input
              className="mt-2"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder="Enter custom role"
              required
            />
          )}
        </Field>
        <ImageUpload label="Photo" value={form.photo} onChange={(v) => set("photo", v)} />
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

      <SaveBar saving={saving} error={saveError} onCancel={() => navigate("/admin/committee")} />
    </form>
  );
}
