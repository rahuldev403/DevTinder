import { useEffect, useState } from "react";
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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update request.");
    } finally {
      setActingOn(null);
    }
  };

  return (
    <AppShell
      title="Connection Requests"
      subtitle="Review incoming requests and decide who to match with."
      actions={
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
          </Button>
        </div>
      }
    >
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      {isLoading ? (
        <Card>
          <CardContent className="grid gap-4 py-8 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border/60 p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted/60 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 w-28 rounded bg-muted/60 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-muted/60 animate-pulse" />
                  </div>
                </div>
                <div className="h-3 w-full rounded bg-muted/60 animate-pulse" />
                <div className="h-8 w-32 rounded bg-muted/50 animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No pending requests right now.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((request) => (
            <Card key={request._id}>
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                    {request.sender?.avatar ? (
                      <img
                        src={request.sender.avatar}
                        alt={request.sender.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {request.sender?.name || "Unknown"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {request.sender?.experienceLevel || ""}
                    </p>
                  </div>
                </div>
                {request.sender?.bio ? (
                  <p className="text-sm text-muted-foreground">
                    {request.sender.bio}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled={actingOn === request._id}
                    onClick={() => handleRespond(request._id, "REJECTED")}
                  >
                    Reject
                  </Button>
                  <Button
                    disabled={actingOn === request._id}
                    onClick={() => handleRespond(request._id, "ACCEPTED")}
                  >
                    Accept
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
