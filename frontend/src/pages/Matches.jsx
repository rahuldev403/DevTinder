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
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Loading matches...
          </CardContent>
        </Card>
      ) : matches.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No matches yet. Keep swiping.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((match) => (
            <Card key={match.matchId}>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                    {match.user?.avatar ? (
                      <img
                        src={match.user.avatar}
                        alt={match.user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {match.user?.name || "Unknown"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {match.user?.experienceLevel || ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {match.compatibilityScore !== null ? (
                    <Badge variant="secondary">
                      {match.compatibilityScore}% compatible
                    </Badge>
                  ) : (
                    <Badge variant="outline">Analyzing compatibility</Badge>
                  )}
                </div>
                {match.compatibilitySummary ? (
                  <p className="text-sm text-muted-foreground">
                    {match.compatibilitySummary}
                  </p>
                ) : null}
                <Button asChild>
                  <Link to={`/chat/${match.matchId}`}>Open chat</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Matches;
