import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FolderOpen, LayoutDashboard, Moon, Receipt, ShieldCheck, Sun } from "lucide-react";
import { api } from "../api/client";
import { getStoredTheme, toggleTheme, type Theme } from "../lib/theme";

type ConnectionState = "checking" | "ok" | "bad";

const trackNav = [
  { to: "/", label: "Spends", icon: Receipt, end: true },
  { to: "/categories", label: "Categories", icon: FolderOpen, end: false },
] as const;

const understandNav = [
  { to: "/analytics", label: "Analytics", icon: LayoutDashboard, end: false },
] as const;

export function Layout() {
  const [connection, setConnection] = useState<ConnectionState>("checking");
  const [detail, setDetail] = useState("Checking API…");
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    let cancelled = false;
    let online = false;
    let steadyTimer: number | undefined;

    async function check() {
      try {
        await api.health();
        const db = await api.healthDb();
        if (cancelled) return;
        if (db.status === "ok") {
          online = true;
          setConnection("ok");
          setDetail("API + database online");
        } else {
          online = false;
          setConnection("bad");
          setDetail(db.detail ?? "Database unhealthy");
        }
      } catch {
        if (!cancelled) {
          online = false;
          setConnection("bad");
          setDetail("API unreachable");
        }
      }
    }

    void check();
    // Poll fast while booting the local API, then settle to 30s.
    const bootTimer = window.setInterval(() => {
      void (async () => {
        await check();
        if (online && steadyTimer == null) {
          window.clearInterval(bootTimer);
          steadyTimer = window.setInterval(() => void check(), 30000);
        }
      })();
    }, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(bootTimer);
      if (steadyTimer != null) window.clearInterval(steadyTimer);
    };
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-drag" data-tauri-drag-region />
        <div className="brand">
          <span className="brand-mark" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 3.2h9v1.7H8.15V11H5.85V4.9H2.5V3.2z" fill="currentColor" />
            </svg>
          </span>
          Trackey
        </div>
        <nav className="nav" aria-label="Main">
          <div className="nav-group" role="group" aria-label="Track">
            <span className="nav-label" aria-hidden>
              Track
            </span>
            {trackNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                <item.icon aria-hidden size={18} strokeWidth={1.75} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
          <div className="nav-group" role="group" aria-label="Understand">
            <span className="nav-label" aria-hidden>
              Understand
            </span>
            {understandNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                <item.icon aria-hidden size={18} strokeWidth={1.75} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="sidebar-tools">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((current) => toggleTheme(current))}
            aria-label={theme === "dark" ? "Switch to day mode" : "Switch to night mode"}
            title={theme === "dark" ? "Day mode" : "Night mode"}
          >
            {theme === "dark" ? (
              <Sun aria-hidden size={16} strokeWidth={1.75} />
            ) : (
              <Moon aria-hidden size={16} strokeWidth={1.75} />
            )}
            <span>{theme === "dark" ? "Day" : "Night"}</span>
          </button>
        </div>
        <div className="sidebar-footer">
          <span className="sidebar-footer-ico" aria-hidden>
            <ShieldCheck size={16} strokeWidth={1.75} />
          </span>
          <span>
            <b>
              <span className={`status-dot ${connection === "ok" ? "ok" : connection === "bad" ? "bad" : ""}`} />
              Local
            </b>
            <small>{detail}</small>
          </span>
        </div>
      </aside>
      <main className="main" id="main" tabIndex={-1}>
        <div className="main-drag" data-tauri-drag-region />
        <div className="main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
