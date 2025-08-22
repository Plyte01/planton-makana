// src/components/admin/inbox-data-table.tsx
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactMessage, MessageStatus } from "@prisma/client";
import { InboxActions } from "./inbox-actions";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

// The column definitions are defined outside the component
export const columns: ColumnDef<ContactMessage>[] = [
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Status <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as MessageStatus;
      const variant: "default" | "secondary" | "outline" = status === 'NEW' ? 'default' : status === 'READ' ? 'secondary' : 'outline';
      return <div className="text-center"><Badge variant={variant}>{status}</Badge></div>;
    },
  },
  {
    accessorKey: "name",
    header: "From",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "subject", header: "Subject" },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Received <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
    ),
    cell: ({ row }) => <div className="text-right">{new Date(row.getValue("createdAt")).toLocaleString()}</div>,
  },
  { id: "actions", cell: ({ row }) => <div className="text-center"><InboxActions message={row.original} /></div> },
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

// This is the actual DataTable component
export function InboxDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Your inbox is empty.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}