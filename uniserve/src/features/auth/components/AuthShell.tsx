import { Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

const HIGHLIGHTS = [
  "Report faults in seconds and follow every update",
  "Assigned officers work from a single queue",
  "Administrators see workload and history in one place",
];

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-white/10">
            <Wrench className="size-5 text-teal-300" aria-hidden />
          </span>
          <span className="text-xl font-semibold tracking-tight">UniServe</span>
        </div>
        <div>
          <h2 className="max-w-md text-3xl font-semibold leading-tight">
            One place for every campus maintenance request.
          </h2>
          <ul className="mt-8 space-y-4 text-navy-100">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal-300" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-400">University Maintenance Management System</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/login" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-lg bg-navy-900">
              <Wrench className="size-4 text-teal-300" aria-hidden />
            </span>
            <span className="text-lg font-semibold text-navy-900">UniServe</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
