import React from 'react';

export interface TableColumn<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  className?: string;
}

export const Table = <T extends unknown>({ data, columns, className = '' }: TableProps<T>) => {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800 ${className}`}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium ${col.className || ''}`}
                >
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
