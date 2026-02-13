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
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      {isLoading ? (
        <Card className="mx-auto max-w-xl">
          <CardContent className="space-y-4 py-10">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-muted/60 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted/60 animate-pulse" />
                <div className="h-3 w-20 rounded bg-muted/60 animate-pulse" />
              </div>
            </div>
            <div className="h-3 w-full rounded bg-muted/60 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-muted/60 animate-pulse" />
            <div className="h-10 w-full rounded bg-muted/40 animate-pulse" />
          </CardContent>
        </Card>
      ) : currentProfile ? (
        <Card className="mx-auto max-w-xl">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-full bg-muted">
                {currentProfile.avatar ? (
                  <img
                    src={currentProfile.avatar}
                    alt={currentProfile.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{currentProfile.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {currentProfile.experienceLevel}
                </p>
              </div>
            </div>
            {currentProfile.bio ? (
              <p className="text-sm text-muted-foreground">
                {currentProfile.bio}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Skills
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {currentProfile.skills?.length ? (
                  currentProfile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No skills listed
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span>
                Availability: {formatAvailability(currentProfile.availability)}
              </span>
            </div>
            {currentProfile.githubLink ? (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm">
                {githubLoading ? (
                  <p className="text-muted-foreground">
                    Loading GitHub preview...
                  </p>
                ) : githubError ? (
                  <p className="text-destructive">{githubError}</p>
                ) : githubPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                      <img
                        src={githubPreview.avatar}
                        alt={githubPreview.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">
                          {githubPreview.name}
                        </span>
                        <a
                          href={githubPreview.url}
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View GitHub
                        </a>
                      </div>
                      {githubPreview.bio ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {githubPreview.bio}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{githubPreview.repos} repos</span>
                        <span>{githubPreview.followers} followers</span>
                        <span>{githubPreview.following} following</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                type="button"
                disabled={isSwiping}
                onClick={() => handleSwipe("left")}
              >
                Skip
              </Button>
              <Button
                type="button"
                disabled={isSwiping}
                onClick={() => handleSwipe("right")}
              >
                Connect
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mx-auto max-w-xl">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No more developers right now. Check back soon.
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
};

export default Feed;
