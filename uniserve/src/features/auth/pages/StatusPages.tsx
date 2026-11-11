import { Link } from "@tanstack/react-router";
import { Compass, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLE_HOME_PATH } from "@/lib/constants";
import { useAuth } from "../hooks/useAuth";

function StatusScreen({
  icon: Icon,
  code,
  title,
  message,
}: {
  icon: typeof Compass;
  code: string;
  title: string;
  message: string;
}) {
  const { user } = useAuth();

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md text-center">
        <span className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-navy-900 text-teal-300">
          <Icon className="size-7" aria-hidden />
        </span>
        <p className="text-sm font-semibold tracking-widest text-ink-muted">{code}</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">{title}</h1>
        <p className="mt-2 text-ink-soft">{message}</p>
        <Button asChild className="mt-8">
          {user ? (
            <Link to={ROLE_HOME_PATH[user.role]}>Go to my dashboard</Link>
          ) : (
            <Link to="/login">Go to sign in</Link>
          )}
        </Button>
      </div>
    </main>
  );
}

export function UnauthorizedPage() {
  return (
    <StatusScreen
      icon={ShieldAlert}
      code="403"
      title="Access restricted"
      message="Your account does not have permission to view this page."
    />
  );
}

export function NotFoundPage() {
  return (
    <StatusScreen
      icon={Compass}
      code="404"
      title="Page not found"
      message="The page you are looking for does not exist or has been moved."
    />
  );
}
