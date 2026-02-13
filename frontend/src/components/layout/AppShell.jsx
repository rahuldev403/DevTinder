import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { logout } from "@/api/auth";

const links = [
  { to: "/feed", label: "Feed", icon: "/feed.png" },
  { to: "/requests", label: "Requests", icon: "/requests.png" },
  { to: "/matches", label: "Matches", icon: "/match.png" },
  { to: "/profile", label: "Profile", icon: "/user.png" },
];

const AppShell = ({ title, subtitle, actions, children }) => {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await logout();
    } catch (error) {
      // Redirect even if logout fails to clear the UI state.
    } finally {
      setIsSigningOut(false);
      navigate("/");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : "-100%",
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="fixed lg:static inset-y-0 left-0 z-50 w-64 border-r-4 border-primary bg-card shadow-xl flex flex-col"
      >
        <div className="border-b-4 border-primary p-6 flex items-center justify-between">
          <img
            src="/codecrush-text.png"
            alt="CodeCrush"
            className="h-8 w-auto"
            style={{ imageRendering: "pixelated" }}
          />
          <button
            onClick={closeSidebar}
            className="lg:hidden border-2 border-primary p-1 font-mono text-xs font-bold text-primary"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Page Title Section */}
        {title && (
          <div className="border-b-4 border-primary/30 p-4 bg-gradient-to-br from-primary/5 to-accent/5">
            <h1 className="font-mono text-lg font-bold text-foreground">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
            {actions ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {actions}
              </div>
            ) : null}
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 border-4 px-4 py-3 font-mono text-sm font-bold shadow-md transition-all hover:shadow-lg hover:translate-x-[-1px] hover:translate-y-[-1px] w-full ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <img
                src={link.icon}
                alt={link.label}
                className="h-6 w-6"
                style={{ imageRendering: "pixelated" }}
              />
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
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile menu button */}
        <div className="lg:hidden border-b-4 border-primary bg-card shadow-lg p-4">
          <button
            onClick={toggleSidebar}
            className="border-4 border-primary p-2 font-mono text-lg font-bold text-primary shadow-md"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        <main className="flex-1 px-4 sm:px-8 py-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
