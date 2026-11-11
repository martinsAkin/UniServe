import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { SidebarNav } from "./SidebarNav";

export function DashboardLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarNav />
      </aside>

      <DialogPrimitive.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy-950/50 lg:hidden" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-pop lg:hidden"
          >
            <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
            <SidebarNav onNavigate={() => setIsMenuOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <div className="lg:pl-64">
        <AppHeader onOpenMenu={() => setIsMenuOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
