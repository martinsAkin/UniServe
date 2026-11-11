import { AlertTriangle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ error, onRetry, title }: ErrorStateProps) {
  const isNetwork = error instanceof ApiError && error.isNetworkError;
  const isNotFound = error instanceof ApiError && error.status === 404;
  const Icon = isNetwork ? WifiOff : AlertTriangle;
  const heading =
    title ??
    (isNotFound ? "Not found" : isNetwork ? "You appear to be offline" : "Something went wrong");
  const message = error instanceof Error ? error.message : "Please try again.";

  return (
    <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-danger">
        <Icon className="size-6" aria-hidden />
      </span>
      <h3 className="font-semibold text-ink">{heading}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-soft">{message}</p>
      {onRetry && !isNotFound && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
