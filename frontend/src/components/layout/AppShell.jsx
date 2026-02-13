import { NavLink } from "react-router-dom";

const links = [
  { to: "/feed", label: "Feed" },
  { to: "/requests", label: "Requests" },
  { to: "/matches", label: "Matches" },
  { to: "/profile", label: "Profile" },
];

const AppShell = ({ title, subtitle, actions, children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              DevTinder
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {actions ? (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {actions}
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
};

export default AppShell;
