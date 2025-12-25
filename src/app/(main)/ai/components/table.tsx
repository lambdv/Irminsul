"use client"

import * as React from "react"

interface DataTableProps {
  data: any[][]
  headers?: string[]
  className?: string
}

export function DataTable({ data, headers, className }: DataTableProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No data available</div>
  }

  return (
    <div className={`w-full overflow-auto ${className || ""}`}>
      <table className="w-full border-collapse border-spacing-0">
        {headers && headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="font-medium text-left p-2 border-b">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
