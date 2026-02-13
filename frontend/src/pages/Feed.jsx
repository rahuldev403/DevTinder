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
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      {isLoading ? (
        <Card className="mx-auto max-w-xl">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Loading developers...
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
              {currentProfile.githubLink ? (
                <a
                  href={currentProfile.githubLink}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub preview
                </a>
              ) : null}
            </div>
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
