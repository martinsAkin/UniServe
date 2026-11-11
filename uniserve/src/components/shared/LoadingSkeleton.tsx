import { Skeleton } from "@/components/ui/skeleton";

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line" aria-busy aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="hidden h-4 w-1/5 sm:block" />
          <Skeleton className="ml-auto h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="Loading">
      <span className="size-8 animate-spin rounded-full border-2 border-line border-t-brand-600" />
    </div>
  );
}
