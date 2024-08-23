"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
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
import { useState } from "react";
import { SelectCategory, SelectCycle, SelectSubcycle } from "@/db/schema";
import SelectBasic from "@/components/common/SelectBasic";
import { useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { expensesActions } from "@/app/actions";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  categories: SelectCategory[];
  cycles: SelectCycle[];
  subcycles: SelectSubcycle[];
}

export function ExpensesTable<TData, TValue>({
  columns,
  data,
  categories,
  cycles,
  subcycles,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      rowSelection,
      columnFilters,
      columnVisibility: {
        subcycleId: false,
        cycleId: false,
        id: false,
      },
    },
  });

  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    startTransition(async () => {
      const expensesIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original)
        .map((row: any) => row.id);
      await expensesActions.deleteExpenses(expensesIds);
    });
    table.resetColumnFilters();
    table.resetRowSelection();
  };

  const filterCycleIdValue = table
    .getColumn("cycleId")
    ?.getFilterValue() as string;

  return (
    <div className="flex flex-col space-y-4">
      <div className="rounded-md border p-4 flex flex-col md:flex-row gap-5 md:gap-10">
        <SelectBasic
          value={filterCycleIdValue ?? ""}
          setValue={(value) =>
            table.getColumn("cycleId")?.setFilterValue(value)
          }
          placeholder="Cycle"
          options={cycles?.map((cycle) => ({
            value: cycle.id,
            label: cycle.title,
          }))}
          disabled={false}
        />
        <SelectBasic
          value={
            (table.getColumn("subcycleId")?.getFilterValue() as string) ?? ""
          }
          setValue={(value) =>
            table.getColumn("subcycleId")?.setFilterValue(value)
          }
          placeholder={
            filterCycleIdValue ? "Subcycle" : "Subcycle (fill the cycle first)"
          }
          options={
            filterCycleIdValue
              ? subcycles
                  ?.filter(
                    (subcycles) => subcycles.cycleId === filterCycleIdValue
                  )
                  .map((subcycle) => ({
                    value: subcycle.id,
                    label: subcycle.title,
                  }))
              : []
          }
          disabled={false}
        />
        <SelectBasic
          disabled={false}
          value={
            categories.find(
              (category) =>
                category.title ===
                (table.getColumn("category")?.getFilterValue() as string)
            )?.id || ""
          }
          setValue={(value) =>
            table
              .getColumn("category")
              ?.setFilterValue(
                categories.find((category) => category.id === value)?.title
              )
          }
          placeholder={
            filterCycleIdValue ? "Category" : "Category (fill the cycle first)"
          }
          options={
            filterCycleIdValue
              ? categories
                  .filter((category) => category.cycleId === filterCycleIdValue)
                  .map((category) => ({
                    value: category.id,
                    label: category.title,
                  }))
              : []
          }
        />
        <div className="flex gap-5">
          <Button
            variant="default"
            disabled={columnFilters.length === 0}
            className="w-1/2 md:w-full"
            onClick={() => table.resetColumnFilters()}
          >
            Clear
          </Button>
          <Button
            disabled={table.getFilteredSelectedRowModel().rows.length <= 0}
            className="w-1/2 md:w-full"
            variant={"destructive"}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array(5)
                .fill(null)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-[80px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="h-[55px]"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
