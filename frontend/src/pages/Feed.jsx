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
  const [githubPreview, setGithubPreview] = useState(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState("");

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

  useEffect(() => {
    let isMounted = true;
    const githubLink = currentProfile?.githubLink;
    if (!githubLink) {
      setGithubPreview(null);
      setGithubError("");
      return () => {
        isMounted = false;
      };
    }

    const username = githubLink.split("github.com/")[1]?.split("/")[0];
    if (!username) {
      setGithubPreview(null);
      setGithubError("Invalid GitHub link");
      return () => {
        isMounted = false;
      };
    }

    const controller = new AbortController();
    setGithubLoading(true);
    setGithubError("");

    fetch(`https://api.github.com/users/${username}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load GitHub profile");
        }
        return response.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setGithubPreview({
          name: data.name || data.login,
          avatar: data.avatar_url,
          followers: data.followers,
          following: data.following,
          repos: data.public_repos,
          url: data.html_url,
          bio: data.bio,
        });
      })
      .catch((err) => {
        if (!isMounted || err.name === "AbortError") return;
        setGithubError(err.message || "Failed to load GitHub profile");
      })
      .finally(() => {
        if (isMounted) setGithubLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [currentProfile?.githubLink]);

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
        <Card className="mx-auto max-w-xl border-4 border-primary bg-card shadow-xl transition-all hover:shadow-2xl hover:translate-x-[-2px] hover:translate-y-[-2px]">
          <CardHeader className="space-y-5 border-b-4 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-center gap-5">
              <div className="relative h-20 w-20 overflow-hidden border-4 border-primary bg-primary/20 shadow-md">
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
                <h2 className="text-2xl font-bold tracking-tight text-foreground font-mono">
                  {currentProfile.name}
                </h2>
                <div className="mt-2 inline-block border-2 border-accent bg-accent/20 px-3 py-1 font-mono text-sm font-semibold text-accent-foreground">
                  {currentProfile.experienceLevel}
                </div>
              </div>
            </div>
            {currentProfile.bio ? (
              <div className="border-l-4 border-accent pl-4 font-mono text-sm leading-relaxed text-muted-foreground">
                "{currentProfile.bio}"
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div>
              <div className="mb-3 flex items-center gap-2 border-b-2 border-primary pb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                  ▸ Skills
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentProfile.skills?.length ? (
                  currentProfile.skills.map((skill, index) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="border-2 border-border font-mono text-xs font-semibold shadow-sm transition-all hover:shadow-md hover:translate-x-[-1px] hover:translate-y-[-1px]"
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

            <div className="border-2 border-muted bg-muted/20 p-3">
              <span className="font-mono text-sm font-semibold text-foreground">
                📅 Availability:{" "}
                <span className="text-primary">
                  {formatAvailability(currentProfile.availability)}
                </span>
              </span>
            </div>

            {currentProfile.githubLink ? (
              <div className="border-4 border-accent bg-gradient-to-br from-accent/10 to-accent/5 p-5 shadow-lg">
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-accent">
                    {"{ GitHub Profile }"}
                  </span>
                </div>
                {githubLoading ? (
                  <p className="font-mono text-sm text-muted-foreground animate-pulse">
                    Loading GitHub preview...
                  </p>
                ) : githubError ? (
                  <p className="font-mono text-sm text-destructive">
                    {githubError}
                  </p>
                ) : githubPreview ? (
                  <div className="flex items-start gap-4">
                    <div
                      className="h-14 w-14 flex-shrink-0 overflow-hidden border-4 border-accent bg-accent/20"
                      style={{ imageRendering: "pixelated" }}
                    >
                      <img
                        src={githubPreview.avatar}
                        alt={githubPreview.name}
                        className="h-full w-full object-cover"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono font-bold text-foreground">
                          {githubPreview.name}
                        </span>
                        <a
                          href={githubPreview.url}
                          className="inline-flex items-center border-2 border-accent bg-accent px-2 py-1 font-mono text-xs font-bold text-accent-foreground shadow-sm transition-all hover:shadow-md hover:translate-x-[-1px] hover:translate-y-[-1px]"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View →
                        </a>
                      </div>
                      {githubPreview.bio ? (
                        <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                          {githubPreview.bio}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs">
                        <span className="text-foreground">
                          <span className="font-bold text-primary">
                            {githubPreview.repos}
                          </span>{" "}
                          repos
                        </span>
                        <span className="text-foreground">
                          <span className="font-bold text-primary">
                            {githubPreview.followers}
                          </span>{" "}
                          followers
                        </span>
                        <span className="text-foreground">
                          <span className="font-bold text-primary">
                            {githubPreview.following}
                          </span>{" "}
                          following
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                variant="secondary"
                type="button"
                disabled={isSwiping}
                onClick={() => handleSwipe("left")}
                className="flex-1 border-4 border-border font-mono text-base font-bold shadow-lg transition-all hover:shadow-xl hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← SKIP
              </Button>
              <Button
                type="button"
                disabled={isSwiping}
                onClick={() => handleSwipe("right")}
                className="flex-1 border-4 border-border font-mono text-base font-bold shadow-lg transition-all hover:shadow-xl hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
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
