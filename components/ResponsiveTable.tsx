interface ResponsiveTableProps {
  headers: string[];
  children: React.ReactNode;
}

export function ResponsiveTable({ headers, children }: ResponsiveTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-pink-100 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-pink-50 to-pink-100 text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-4 py-3 text-left font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
