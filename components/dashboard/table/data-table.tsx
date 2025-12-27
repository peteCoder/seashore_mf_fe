"use client";

import { ReactNode } from "react";

// ✅ FIXED: Column interface now supports both string and function accessors
interface Column {
  header: string;
  accessor: string | ((row: any) => any); // ✅ Can be string OR function
  cell?: (value: any, row: any) => ReactNode;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  showActions?: boolean;
  actionMenu?: (row: any) => ReactNode;
}

export function DataTable({
  columns,
  data,
  onRowClick,
  showActions = true,
  actionMenu,
}: DataTableProps) {
  // ✅ Helper function to get cell value
  const getCellValue = (row: any, accessor: string | ((row: any) => any)) => {
    if (typeof accessor === "function") {
      return accessor(row);
    }
    return row[accessor];
  };

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-visible border border-gray-200 dark:border-gray-800 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-[#0f172a]">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={
                      typeof column.accessor === "string"
                        ? column.accessor
                        : `col-${index}`
                    }
                    scope="col"
                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                      column.className || ""
                    }`}
                  >
                    {column.header}
                  </th>
                ))}
                {showActions && (
                  <th
                    scope="col"
                    className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1e293b] divide-y divide-gray-200 dark:divide-gray-800">
              {data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${
                    onRowClick
                      ? "hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  {columns.map((column, colIndex) => {
                    const cellValue = getCellValue(row, column.accessor);

                    return (
                      <td
                        key={
                          typeof column.accessor === "string"
                            ? column.accessor
                            : `cell-${colIndex}`
                        }
                        className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm ${
                          column.className || ""
                        }`}
                      >
                        {column.cell ? column.cell(cellValue, row) : cellValue}
                      </td>
                    );
                  })}
                  {showActions && actionMenu && (
                    <td
                      className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actionMenu(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
