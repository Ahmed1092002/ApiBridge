import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Terminal,
  Settings,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Menu,
  X,
  Code2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../api";

export function Shell(): React.JSX.Element {
  const { currentUser, selectedUserId } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Overview", icon: LayoutDashboard },
    { to: "/tasks", label: "Tasks", icon: CheckSquare },
    { to: "/explorer", label: "API Explorer", icon: Terminal },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 antialiased">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo and Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                ApiBridge
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-500/20 text-brand-400 rounded border border-brand-500/30">
                  v1.0
                </span>
              </span>
              <p className="text-[11px] text-slate-400 leading-tight">Contract-First Toolkit</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/25"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Documentation
          </div>
          <a
            href={`${API_BASE_URL}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Swagger UI</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </nav>

        {/* Active Auth User Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              {selectedUserId === "anonymous" ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400">Unauthenticated</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Authenticated</span>
                </>
              )}
            </span>
            <NavLink
              to="/settings"
              className="text-[11px] text-brand-400 hover:underline hover:text-brand-300 font-medium"
            >
              Switch
            </NavLink>
          </div>

          {currentUser ? (
            <div className="flex items-center space-x-3 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
              <img
                src={
                  currentUser.avatarUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64"
                }
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/40"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
              </div>
              <span className="capitalize text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentUser.role}
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <p className="font-semibold">Simulated Anonymous Mode</p>
              <p className="text-[11px] text-amber-400/80 mt-0.5">
                Write operations will return 401 UNAUTHORIZED.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="h-16 lg:hidden bg-white border-b border-slate-200 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-slate-900">ApiBridge</span>
          </div>
          <span className="text-xs px-2 py-1 rounded bg-brand-50 text-brand-700 font-medium border border-brand-200">
            Demo Console
          </span>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
