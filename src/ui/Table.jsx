/**
 * Table Component
 * Table with loading and empty states
 */

import React from 'react';
import { ChevronUp } from 'lucide-react';

export const Table = React.forwardRef(
  ({ className = '', children, ...props }, ref) => (
    <div className="w-full overflow-x-auto">
      <table ref={ref} className={`w-full text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  )
);

Table.displayName = 'Table';

export const TableHead = React.forwardRef(
  ({ className = '', children, ...props }, ref) => (
    <thead
      ref={ref}
      className={`bg-gray-50 border-b border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </thead>
  )
);

TableHead.displayName = 'TableHead';

export const TableHeader = React.forwardRef(
  ({ className = '', children, sortable = false, onClick, ...props }, ref) => (
    <th
      ref={ref}
      className={`px-6 py-3 text-left font-medium text-gray-700 ${sortable ? 'cursor-pointer hover:bg-gray-100' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && <ChevronUp className="h-4 w-4 text-gray-400" />}
      </div>
    </th>
  )
);

TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef(
  ({ className = '', children, ...props }, ref) => (
    <tbody ref={ref} className={`divide-y divide-gray-200 ${className}`} {...props}>
      {children}
    </tbody>
  )
);

TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef(
  ({ className = '', children, isHoverable = true, ...props }, ref) => (
    <tr
      ref={ref}
      className={`${isHoverable ? 'hover:bg-gray-50 transition-colors' : ''} ${className}`}
      {...props}
    >
      {children}
    </tr>
  )
);

TableRow.displayName = 'TableRow';

export const TableCell = React.forwardRef(
  ({ className = '', children, isHeader = false, ...props }, ref) => (
    <td
      ref={ref}
      className={`px-6 py-4 ${isHeader ? 'font-medium text-gray-900' : ''} ${className}`}
      {...props}
    >
      {children}
    </td>
  )
);

TableCell.displayName = 'TableCell';

export const TableEmpty = ({ columns = 1, message = 'No data found' }) => (
  <div className="w-full py-12 text-center">
    <p className="text-gray-500">{message}</p>
  </div>
);

export const TableLoading = ({ columns = 1 }) => (
  <div className="w-full">
    {[1, 2, 3].map((i) => (
      <div key={i} className="px-6 py-4 border-b border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded" style={{ width: `${Math.random() * 60 + 40}%` }} />
      </div>
    ))}
  </div>
);
