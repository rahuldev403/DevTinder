import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fetchFeed, swipeUser } from "@/api/user";

const formatAvailability = (value) =>
  value
    .toLowerCase()
    .replace("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const Feed = () => {
  const [page, setPage] = useState(1);
  const [feed, setFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwiping, setIsSwiping] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const currentProfile = useMemo(() => feed[0], [feed]);

  useEffect(() => {
    let isMounted = true;

    const loadFeed = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await fetchFeed({ page, limit: 1 });
        if (!isMounted) return;
        setFeed(data.users || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Failed to load feed.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadFeed();

    return () => {
      isMounted = false;
    };
  }, [page]);

  const handleSwipe = async (action) => {
    if (!currentProfile) return;
    setIsSwiping(true);
    setError("");

    try {
      await swipeUser({ targetUserId: currentProfile._id, action });
      setFeed((prev) => prev.slice(1));
      if (feed.length <= 1 && page < totalPages) {
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Swipe failed.");
    } finally {
      setIsSwiping(false);
    }
  };

  return (
    <AppShell
      title="Main Feed"
      subtitle="Swipe right to connect or left to skip."
    >
      {error ? (
        <div className="mb-4 border-4 border-destructive bg-destructive/10 p-4 font-mono text-sm text-destructive shadow-lg">
          ⚠ {error}
        </div>
      ) : null}

      {isLoading ? (
        <Card className="mx-auto max-w-xl border-4 border-primary shadow-xl">
          <CardContent className="space-y-4 py-10">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 border-4 border-primary bg-primary/20 animate-pulse" />
              <div className="space-y-3">
                <div className="h-5 w-32 border-2 border-muted bg-muted/60 animate-pulse" />
                <div className="h-4 w-20 border-2 border-muted bg-muted/40 animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-full border-2 border-muted bg-muted/60 animate-pulse" />
            <div className="h-4 w-3/4 border-2 border-muted bg-muted/60 animate-pulse" />
            <div className="h-12 w-full border-2 border-muted bg-muted/40 animate-pulse" />
          </CardContent>
        </Card>
      ) : currentProfile ? (
        <Card className="mx-auto max-w-lg border-4 border-primary bg-card shadow-xl">
          <CardHeader className="space-y-3 border-b-4 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-4">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden border-4 border-primary bg-primary/20 shadow-md">
                {currentProfile.avatar ? (
                  <img
                    src={currentProfile.avatar}
                    alt={currentProfile.name}
                    className="h-full w-full object-cover pixelated"
                    style={{ imageRendering: "pixelated" }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono text-3xl font-bold text-primary">
                    {currentProfile.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground font-mono">
                  {currentProfile.name}
                </h2>
                <div className="mt-1 inline-block border-2 border-accent bg-accent/20 px-2 py-0.5 font-mono text-xs font-semibold text-accent-foreground">
                  {currentProfile.experienceLevel}
                </div>
              </div>
            </div>
            {currentProfile.bio ? (
              <div className="border-l-4 border-accent pl-3 font-mono text-xs leading-snug text-muted-foreground">
                "{currentProfile.bio}"
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div>
              <div className="mb-2 flex items-center gap-2 border-b-2 border-primary pb-1">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                  ▸ Skills
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentProfile.skills?.length ? (
                  currentProfile.skills.map((skill, index) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="border-2 border-border font-mono text-xs font-semibold shadow-sm"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="font-mono text-sm text-muted-foreground">
                    // No skills listed
                  </span>
                )}
              </div>
            </div>

            <div className="border-2 border-muted bg-muted/20 p-2">
              <span className="font-mono text-xs font-semibold text-foreground flex items-center gap-2">
                <img
                  src="/calendar.png"
                  alt="Calendar"
                  className="h-4 w-4 inline-block"
                  style={{ imageRendering: "pixelated" }}
                />
                Availability:{" "}
                <span className="text-primary">
                  {formatAvailability(currentProfile.availability)}
                </span>
              </span>
            </div>

            {currentProfile.githubLink && currentProfile.githubData ? (
              <div className="border-4 border-accent bg-gradient-to-br from-accent/10 to-accent/5 p-3 shadow-lg">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-accent">
                    {"{ GitHub Profile }"}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 flex-shrink-0 overflow-hidden border-4 border-accent bg-accent/20"
                    style={{ imageRendering: "pixelated" }}
                  >
                    <img
                      src={currentProfile.githubData.avatar_url}
                      alt={
                        currentProfile.githubData.name ||
                        currentProfile.githubData.login
                      }
                      className="h-full w-full object-cover"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono font-bold text-foreground">
                        {currentProfile.githubData.name ||
                          currentProfile.githubData.login}
                      </span>
                      <a
                        href={currentProfile.githubData.html_url}
                        className="inline-flex items-center border-2 border-accent bg-accent px-2 py-1 font-mono text-xs font-bold text-accent-foreground shadow-sm"
                        target="_blank"
                        rel="noreferrer"
                      >
                        View →
                      </a>
                    </div>
                    {currentProfile.githubData.bio ? (
                      <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                        {currentProfile.githubData.bio}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs">
                      <span className="text-foreground">
                        <span className="font-bold text-primary">
                          {currentProfile.githubData.public_repos}
                        </span>{" "}
                        repos
                      </span>
                      <span className="text-foreground">
                        <span className="font-bold text-primary">
                          {currentProfile.githubData.followers}
                        </span>{" "}
                        followers
                      </span>
                      <span className="text-foreground">
                        <span className="font-bold text-primary">
                          {currentProfile.githubData.following}
                        </span>{" "}
                        following
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                variant="secondary"
                type="button"
                disabled={isSwiping}
                onClick={() => handleSwipe("left")}
                className="flex-1 border-4 border-border font-mono text-base font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← SKIP
              </Button>
              <Button
                type="button"
                disabled={isSwiping}
                onClick={() => handleSwipe("right")}
                className="flex-1 border-4 border-border font-mono text-base font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CONNECT →
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mx-auto max-w-xl border-4 border-border shadow-xl">
          <CardContent className="py-12 text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <p className="font-mono text-base font-semibold text-muted-foreground">
              // No more developers right now
            </p>
            <p className="mt-2 font-mono text-sm text-muted-foreground/60">
              Check back soon!
            </p>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
};

export default Feed;
