
import React from 'react';

interface DataTableProps {
  data: any[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object' || data[0][key] === null);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-left border-collapse bg-white">
        <thead>
          <tr className="bg-slate-50 border-bottom border-slate-200">
            {headers.map(header => (
              <th key={header} className="px-4 py-3 text-xs font-bold uppercase text-slate-500 tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.slice(0, 100).map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50 transition-colors">
              {headers.map(header => (
                <td key={header} className="px-4 py-3 text-sm text-slate-600 truncate max-w-[200px]">
                  {String(row[header] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 100 && (
        <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 border-t">
          Exibindo apenas os primeiros 100 registros
        </div>
      )}
    </div>
  );
};

export default DataTable;
