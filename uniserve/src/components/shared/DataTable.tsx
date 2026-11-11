import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { ListSkeleton } from "./LoadingSkeleton";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Hide the column on mobile cards (e.g. when the primary cell already conveys it). */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  getRowKey: (row: T) => string;
  isLoading: boolean;
  isFetching?: boolean;
  error: unknown;
  onRetry?: () => void;
  empty: { title: string; description?: string; action?: ReactNode };
  footer?: ReactNode;
  toolbar?: ReactNode;
}

/** Renders a table from md upwards and a stacked card list on small screens. */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  isLoading,
  isFetching,
  error,
  onRetry,
  empty,
  footer,
  toolbar,
}: DataTableProps<T>) {
  const [primary, ...rest] = columns;

  return (
    <Card className="overflow-hidden">
      {toolbar && (
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:flex-wrap sm:items-center">
          {toolbar}
        </div>
      )}

      <div className={cn("transition-opacity", isFetching && !isLoading && "opacity-60")}>
        {isLoading ? (
          <ListSkeleton />
        ) : error ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : !rows || rows.length === 0 ? (
          <EmptyState {...empty} />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {columns.map((column) => (
                      <TableHead key={column.header} className={column.className}>
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={getRowKey(row)}>
                      {columns.map((column) => (
                        <TableCell key={column.header} className={column.className}>
                          {column.cell(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <ul className="divide-y divide-line md:hidden">
              {rows.map((row) => (
                <li key={getRowKey(row)} className="space-y-2 p-4">
                  <div className="font-medium">{primary.cell(row)}</div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                    {rest
                      .filter((column) => !column.hideOnMobile)
                      .map((column) => (
                        <div key={column.header} className="contents">
                          <dt className="text-ink-muted">{column.header}</dt>
                          <dd className="min-w-0 text-ink">{column.cell(row)}</dd>
                        </div>
                      ))}
                  </dl>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {footer}
    </Card>
  );
}
