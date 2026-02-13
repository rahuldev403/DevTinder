import { useEffect, useState } from "react";
import { toast } from "sonner";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchRequests, respondToRequest } from "@/api/user";

const Requests = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingOn, setActingOn] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadRequests = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await fetchRequests({ page, limit: 6 });
        if (!isMounted) return;
        setRequests(data.requests || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Failed to load requests.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, [page]);

  const handleRespond = async (requestId, action) => {
    setActingOn(requestId);
    setError("");

    try {
      await respondToRequest(requestId, action);
      setRequests((prev) => prev.filter((req) => req._id !== requestId));

      if (action === "accept") {
        toast.success("Request accepted! 🎉", {
          description: "You've made a new connection",
          duration: 3000,
        });
      } else {
        toast.info("Request declined", {
          description: "The request was removed",
          duration: 2000,
        });
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update request.";
      setError(errorMsg);
      toast.error("Action failed", {
        description: errorMsg,
        duration: 3000,
      });
    } finally {
      setActingOn(null);
    }
  };

  return (
    <AppShell
      title="Connection Requests"
      subtitle="Review incoming requests and decide who to match with."
      actions={
        <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="border-2 border-border font-mono font-bold shadow-sm"
          >
            ← Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="border-2 border-border font-mono font-bold shadow-sm"
          >
            Next →
          </Button>
        </div>
      }
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
                <div className="h-3 w-full border-2 border-muted bg-muted/60 animate-pulse" />
                <div className="h-10 w-32 border-2 border-muted bg-muted/50 animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card className="border-4 border-muted shadow-xl">
          <CardContent className="py-12 text-center">
            <div className="mb-4 flex justify-center">
              <img
                src="/postbox.png"
                alt="Empty postbox"
                className="h-24 w-24"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <p className="font-mono text-base font-semibold text-muted-foreground">
              // No pending requests right now
            </p>
            <p className="mt-2 font-mono text-sm text-muted-foreground/60">
              Check back later!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((request) => (
            <Card
              key={request._id}
              className="border-4 border-primary shadow-xl"
            >
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 flex-shrink-0 overflow-hidden border-4 border-primary bg-primary/20 shadow-md"
                    style={{ imageRendering: "pixelated" }}
                  >
                    {request.sender?.avatar ? (
                      <img
                        src={request.sender.avatar}
                        alt={request.sender.name}
                        className="h-full w-full object-cover"
                        style={{ imageRendering: "pixelated" }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-mono text-2xl font-bold text-primary">
                        {request.sender?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-mono text-base font-bold text-foreground truncate">
                      {request.sender?.name || "Unknown"}
                    </h3>
                    <div className="mt-0.5 inline-block border-2 border-accent bg-accent/20 px-2 py-0.5 font-mono text-xs font-semibold text-accent-foreground">
                      {request.sender?.experienceLevel || ""}
                    </div>
                  </div>
                </div>

                {request.sender?.bio ? (
                  <div className="border-l-4 border-accent pl-2 font-mono text-xs leading-snug text-muted-foreground">
                    "{request.sender.bio}"
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled={actingOn === request._id}
                    onClick={() => handleRespond(request._id, "REJECTED")}
                    className="flex-1 border-4 border-border font-mono text-sm font-bold shadow-lg disabled:opacity-50"
                  >
                    ✗ Reject
                  </Button>
                  <Button
                    disabled={actingOn === request._id}
                    onClick={() => handleRespond(request._id, "ACCEPTED")}
                    className="flex-1 border-4 border-border font-mono text-sm font-bold shadow-lg disabled:opacity-50"
                  >
                    ✓ Accept
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Requests;
