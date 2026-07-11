export function DataTable({ columns, rows, rowKey, onRowClick, empty = "Nothing here yet." }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-cream-200 bg-white p-8 text-center text-sm text-ink-700">
        {empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-cream-200 bg-white shadow-soft">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-cream-200 bg-cream-200/50 text-xs font-semibold uppercase tracking-wide text-ink-700">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cream-200">
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? "cursor-pointer hover:bg-cream-200/40" : ""}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 align-middle text-ink ${col.className || ""}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
