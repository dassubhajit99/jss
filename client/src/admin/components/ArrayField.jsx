import { Input } from "./FormField.jsx";

// Generic list-of-X editor. `value` is an array; `renderRow(item, update, index)`
// renders the editable row and calls `update(nextItem)` (merge semantics left to
// the caller) or `update(nextValue)` directly for scalar rows. `newItem()`
// produces a fresh row appended by "Add".
export function ArrayField({ value = [], onChange, renderRow, newItem = () => "", label, addLabel = "Add" }) {
  function update(idx, next) {
    const copy = value.slice();
    copy[idx] = next;
    onChange(copy);
  }
  function remove(idx) {
    onChange(value.filter((_, i) => i !== idx));
  }
  function move(idx, dir) {
    const target = idx + dir;
    if (target < 0 || target >= value.length) return;
    const copy = value.slice();
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    onChange(copy);
  }
  function add() {
    onChange([...value, newItem()]);
  }

  const defaultRow = (item, upd) => (
    <Input value={item} onChange={(e) => upd(e.target.value)} />
  );

  return (
    <div>
      {label && <span className="mb-1 block text-sm font-medium text-ink-700">{label}</span>}
      <div className="space-y-2">
        {value.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 rounded-xl border border-cream-200 bg-white p-2">
            <div className="flex-1">{(renderRow || defaultRow)(item, (next) => update(idx, next), idx)}</div>
            <div className="flex shrink-0 gap-1 pt-1">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="rounded-lg px-2 py-1 text-sm text-ink-700 hover:bg-cream-200 disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === value.length - 1}
                className="rounded-lg px-2 py-1 text-sm text-ink-700 hover:bg-cream-200 disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="rounded-lg px-2 py-1 text-sm text-maroon hover:bg-maroon/10"
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 rounded-xl border border-maroon px-3 py-1.5 text-xs font-semibold text-maroon hover:bg-maroon hover:text-white"
      >
        {addLabel}
      </button>
    </div>
  );
}
