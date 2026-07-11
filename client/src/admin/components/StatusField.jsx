import { Select } from "./FormField.jsx";

export function StatusSelect({ value, onChange }) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="published">Published</option>
      <option value="draft">Draft</option>
    </Select>
  );
}

export function StatusBadge({ status }) {
  const isDraft = status === "draft";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isDraft ? "bg-gold-300/60 text-ink" : "bg-maroon/10 text-maroon"
      }`}
    >
      {isDraft ? "Draft" : "Published"}
    </span>
  );
}
