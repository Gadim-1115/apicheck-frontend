import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import YoxlaPage from "./pages/YoxlaPage";
import { getAuthUser } from "./hooks/useAuth";
import type { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
  const user = getAuthUser();
  if (!user) return <Navigate to="/login-olmaq-ucun-cetin-yol" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const user = getAuthUser();
  if (!user) return <Navigate to="/login-olmaq-ucun-cetin-yol" replace />;
  if (user.role !== "ADMIN")
    return <Navigate to="/yoxla-girmek-ucun-cetin-yol" replace />;
  return <>{children}</>;
}

function RedirectIfLoggedIn({ children }: { children: ReactNode }) {
  const user = getAuthUser();
  if (user)
    return (
      <Navigate
        to={
          user.role === "ADMIN"
            ? "/dashboard-girmek-ucun-cetin-yol"
            : "/yoxla-girmek-ucun-cetin-yol"
        }
        replace
      />
    );
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div></div>} />
        <Route
          path="/login-olmaq-ucun-cetin-yol"
          element={
            <RedirectIfLoggedIn>
              <LoginPage />
            </RedirectIfLoggedIn>
          }
        />
        <Route
          path="/yoxla-girmek-ucun-cetin-yol"
          element={
            <RequireAuth>
              <YoxlaPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard-girmek-ucun-cetin-yol"
          element={
            <RequireAdmin>
              <DashboardPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
