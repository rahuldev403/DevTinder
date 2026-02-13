import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { logout } from "@/api/auth";

const links = [
  { to: "/feed", label: "Feed", icon: "🎯" },
  { to: "/requests", label: "Requests", icon: "📬" },
  { to: "/matches", label: "Matches", icon: "💫" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

const AppShell = ({ title, subtitle, actions, children }) => {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await logout();
    } catch (error) {
      // Redirect even if logout fails to clear the UI state.
    } finally {
      setIsSigningOut(false);
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r-4 border-primary bg-card shadow-xl flex flex-col">
        <div className="border-b-4 border-primary p-6">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-primary">
            &lt;DevTinder/&gt;
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 border-4 px-4 py-3 font-mono text-sm font-bold shadow-md transition-all hover:shadow-lg hover:translate-x-[-1px] hover:translate-y-[-1px] w-full ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t-4 border-primary p-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full border-4 border-destructive/30 font-mono font-bold shadow-md hover:bg-destructive/10 hover:shadow-lg"
          >
            {isSigningOut ? "..." : "Sign out"}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b-4 border-primary bg-card shadow-lg px-8 py-6">
          <h1 className="font-mono text-2xl font-bold sm:text-3xl">{title}</h1>
          {subtitle ? (
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
          {actions ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {actions}
            </div>
          ) : null}
        </header>

        <main className="flex-1 px-8 py-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
