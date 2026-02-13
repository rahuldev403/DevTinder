import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchMatches } from "@/api/user";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadMatches = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await fetchMatches();
        if (!isMounted) return;
        setMatches(data.matches || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Failed to load matches.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMatches();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppShell
      title="Matches"
      subtitle="Check compatibility and jump into a conversation."
    >
      {error ? (
        <div className="mb-4 border-4 border-destructive bg-destructive/10 p-4 font-mono text-sm text-destructive shadow-lg">
          ⚠ {error}
        </div>
      ) : null}

      {isLoading ? (
        <Card className="border-4 border-primary shadow-xl">
          <CardContent className="grid gap-4 py-8 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="border-4 border-muted p-4 space-y-3 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 border-4 border-primary bg-primary/20 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-28 border-2 border-muted bg-muted/60 animate-pulse" />
                    <div className="h-3 w-16 border-2 border-muted bg-muted/60 animate-pulse" />
                  </div>
                </div>
                <div className="h-3 w-32 border-2 border-muted bg-muted/60 animate-pulse" />
                <div className="h-10 w-28 border-2 border-muted bg-muted/50 animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : matches.length === 0 ? (
        <Card className="border-4 border-muted shadow-xl">
          <CardContent className="py-12 text-center">
            <div className="mb-4 text-6xl">💫</div>
            <p className="font-mono text-base font-semibold text-muted-foreground">
              // No matches yet
            </p>
            <p className="mt-2 font-mono text-sm text-muted-foreground/60">
              Keep swiping!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((match) => (
            <Card
              key={match.matchId}
              className="border-4 border-primary shadow-xl"
            >
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 flex-shrink-0 overflow-hidden border-4 border-primary bg-primary/20 shadow-md"
                    style={{ imageRendering: "pixelated" }}
                  >
                    {match.user?.avatar ? (
                      <img
                        src={match.user.avatar}
                        alt={match.user.name}
                        className="h-full w-full object-cover"
                        style={{ imageRendering: "pixelated" }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-mono text-2xl font-bold text-primary">
                        {match.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-mono text-base font-bold text-foreground truncate">
                      {match.user?.name || "Unknown"}
                    </h3>
                    <div className="mt-0.5 inline-block border-2 border-accent bg-accent/20 px-2 py-0.5 font-mono text-xs font-semibold text-accent-foreground">
                      {match.user?.experienceLevel || ""}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {match.compatibilityScore !== null ? (
                    <Badge
                      variant="secondary"
                      className="border-2 border-border font-mono text-xs font-semibold shadow-sm"
                    >
                      {match.compatibilityScore}% compatible
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-2 font-mono text-xs"
                    >
                      Analyzing compatibility
                    </Badge>
                  )}
                </div>

                {match.compatibilitySummary ? (
                  <div className="border-l-4 border-accent pl-2 font-mono text-xs leading-snug text-muted-foreground">
                    {match.compatibilitySummary}
                  </div>
                ) : null}

                <Link to={`/chat/${match.matchId}`}>
                  <Button className="w-full border-4 border-border font-mono text-sm font-bold shadow-lg">
                    Open chat →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Matches;
