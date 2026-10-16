import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { Shell } from "./components/layout/Shell";
import { OverviewPage } from "./pages/OverviewPage";
import { TasksPage } from "./pages/TasksPage";
import { ApiExplorerPage } from "./pages/ApiExplorerPage";
import { SettingsPage } from "./pages/SettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

export function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Shell />}>
              <Route index element={<OverviewPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="explorer" element={<ApiExplorerPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
