import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Navigate,
  Outlet,
} from "@tanstack/react-router";
import { AdminRequestDetailsPage } from "@/features/admin/pages/AdminRequestDetailsPage";
import { AdminRequestsPage } from "@/features/admin/pages/AdminRequestsPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { NotFoundPage, UnauthorizedPage } from "@/features/auth/pages/StatusPages";
import { OfficerDashboardPage } from "@/features/maintenance/pages/OfficerDashboardPage";
import { OfficerRequestDetailsPage } from "@/features/maintenance/pages/OfficerRequestDetailsPage";
import { OfficerRequestsPage } from "@/features/maintenance/pages/OfficerRequestsPage";
import { NewRequestPage } from "@/features/student/pages/NewRequestPage";
import { StudentDashboardPage } from "@/features/student/pages/StudentDashboardPage";
import { StudentRequestDetailsPage } from "@/features/student/pages/StudentRequestDetailsPage";
import { StudentRequestsPage } from "@/features/student/pages/StudentRequestsPage";
import { AdminUserDetailsPage } from "@/features/users/pages/AdminUserDetailsPage";
import { AdminUsersPage } from "@/features/users/pages/AdminUsersPage";
import { AdminWorkspace, OfficerWorkspace, StudentWorkspace } from "../layouts/Workspaces";
import { GuestOnly, HomeRedirect } from "./guards";

const rootRoute = createRootRoute({ component: Outlet, notFoundComponent: NotFoundPage });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeRedirect,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <GuestOnly>
      <LoginPage />
    </GuestOnly>
  ),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: () => (
    <GuestOnly>
      <RegisterPage />
    </GuestOnly>
  ),
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: () => (
    <GuestOnly>
      <ForgotPasswordPage />
    </GuestOnly>
  ),
});

const unauthorizedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/unauthorized",
  component: UnauthorizedPage,
});

// Student / staff
const studentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student",
  component: StudentWorkspace,
});
const studentRoutes = [
  createRoute({
    getParentRoute: () => studentRoute,
    path: "/",
    component: () => <Navigate to="/student/dashboard" replace />,
  }),
  createRoute({
    getParentRoute: () => studentRoute,
    path: "dashboard",
    component: StudentDashboardPage,
  }),
  createRoute({
    getParentRoute: () => studentRoute,
    path: "requests",
    component: StudentRequestsPage,
  }),
  createRoute({
    getParentRoute: () => studentRoute,
    path: "requests/new",
    component: NewRequestPage,
  }),
  createRoute({
    getParentRoute: () => studentRoute,
    path: "requests/$id",
    component: StudentRequestDetailsPage,
  }),
];

// Maintenance officer
const officerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/officer",
  component: OfficerWorkspace,
});
const officerRoutes = [
  createRoute({
    getParentRoute: () => officerRoute,
    path: "/",
    component: () => <Navigate to="/officer/dashboard" replace />,
  }),
  createRoute({
    getParentRoute: () => officerRoute,
    path: "dashboard",
    component: OfficerDashboardPage,
  }),
  createRoute({
    getParentRoute: () => officerRoute,
    path: "requests",
    component: OfficerRequestsPage,
  }),
  createRoute({
    getParentRoute: () => officerRoute,
    path: "requests/$id",
    component: OfficerRequestDetailsPage,
  }),
];

// Administrator
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminWorkspace,
});
const adminRoutes = [
  createRoute({
    getParentRoute: () => adminRoute,
    path: "/",
    component: () => <Navigate to="/admin/dashboard" replace />,
  }),
  createRoute({
    getParentRoute: () => adminRoute,
    path: "dashboard",
    component: lazyRouteComponent(
      () => import("@/features/admin/pages/AdminDashboardPage"),
      "AdminDashboardPage",
    ),
  }),
  createRoute({ getParentRoute: () => adminRoute, path: "requests", component: AdminRequestsPage }),
  createRoute({
    getParentRoute: () => adminRoute,
    path: "requests/$id",
    component: AdminRequestDetailsPage,
  }),
  createRoute({ getParentRoute: () => adminRoute, path: "users", component: AdminUsersPage }),
  createRoute({
    getParentRoute: () => adminRoute,
    path: "users/$id",
    component: AdminUserDetailsPage,
  }),
  createRoute({
    getParentRoute: () => adminRoute,
    path: "reports",
    component: lazyRouteComponent(
      () => import("@/features/reports/pages/AdminReportsPage"),
      "AdminReportsPage",
    ),
  }),
];

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  unauthorizedRoute,
  studentRoute.addChildren(studentRoutes),
  officerRoute.addChildren(officerRoutes),
  adminRoute.addChildren(adminRoutes),
]);

export const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
