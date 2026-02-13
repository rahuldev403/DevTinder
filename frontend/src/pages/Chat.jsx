import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { deleteMessage, fetchMessages } from "@/api/messages";
import { fetchMe } from "@/api/user";
import { createSocket } from "@/lib/socket";

const Chat = () => {
  const { matchId } = useParams();
  const socketRef = useRef(null);
  const typingTimeout = useRef(null);

  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [otherUserId, setOtherUserId] = useState("");
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      try {
        const [messageData, meData] = await Promise.all([
          fetchMessages(matchId),
          fetchMe(),
        ]);
        if (!isMounted) return;
        setMessages(messageData.messages || []);
        setCurrentUserId(meData.user?._id || "");
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Failed to load chat.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [matchId]);

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-room", matchId);
    });

    socket.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("message-deleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    socket.on("user-typing", ({ userId }) => {
      if (userId !== currentUserId) setIsTyping(true);
    });

    socket.on("user-stop-typing", ({ userId }) => {
      if (userId !== currentUserId) setIsTyping(false);
    });

    socket.on("other-user-status", ({ userId, online }) => {
      setOtherUserId(userId);
      setOtherUserOnline(online);
    });

    socket.on("user-online", (userId) => {
      if (userId === otherUserId) setOtherUserOnline(true);
    });

    socket.on("user-offline", (userId) => {
      if (userId === otherUserId) setOtherUserOnline(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [matchId, currentUserId, otherUserId]);

  const handleSend = () => {
    const message = messageInput.trim();
    if (!message) return;

    if (!socketRef.current) {
      setError("Socket not connected. Try again.");
      return;
    }

    socketRef.current.emit("send-message", { matchId, content: message });
    setMessageInput("");
  };

  const handleDelete = async (messageId) => {
    setDeletingId(messageId);
    setError("");
    try {
      await deleteMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete message.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTyping = (value) => {
    setMessageInput(value);

    if (!socketRef.current) return;

    socketRef.current.emit("typing", matchId);
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit("stop-typing", matchId);
    }, 900);
  };

  return (
    <AppShell
      title="Chat"
      subtitle="Connect and collaborate"
      actions={
        <div className="font-mono text-sm">
          {otherUserId ? (
            otherUserOnline ? (
              <span className="text-primary">● Online</span>
            ) : (
              <span className="text-muted-foreground">○ Offline</span>
            )
          ) : (
            "Status loading..."
          )}
        </div>
      }
    >
      {error ? (
        <div className="mb-4 border-4 border-destructive bg-destructive/10 p-4 font-mono text-sm text-destructive shadow-lg">
          ⚠ {error}
        </div>
      ) : null}

      {/* Chat container - full height layout */}
      <div className="flex h-[calc(100vh-120px)] flex-col gap-4">
        {/* Messages area - scrollable */}
        <Card className="flex-1 border-4 border-primary shadow-xl overflow-hidden">
          <CardContent className="custom-scrollbar h-full overflow-y-auto p-6 flex flex-col gap-3">
            {loading ? (
              <p className="font-mono text-sm text-muted-foreground">
                Loading messages...
              </p>
            ) : messages.length === 0 ? (
              <div className="py-8 text-center">
                <p className="font-mono text-base text-muted-foreground">
                  // No messages yet
                </p>
                <p className="mt-2 font-mono text-sm text-muted-foreground/60">
                  Say hello! 👋
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isMine =
                  message.senderId?._id === currentUserId ||
                  message.senderId === currentUserId;
                const senderAvatar =
                  typeof message.senderId === "object"
                    ? message.senderId?.avatar
                    : null;
                const senderName =
                  typeof message.senderId === "object"
                    ? message.senderId?.name
                    : "User";

                return (
                  <div
                    key={message._id}
                    className={`flex items-start gap-3 ${
                      isMine ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div
                        className="h-10 w-10 overflow-hidden border-4 border-primary bg-primary/20"
                        style={{ imageRendering: "pixelated" }}
                      >
                        {senderAvatar ? (
                          <img
                            src={senderAvatar}
                            alt={senderName}
                            className="h-full w-full object-cover"
                            style={{ imageRendering: "pixelated" }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-mono text-xs font-bold text-primary">
                            {senderName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message bubble */}
                    <div
                      className={`flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[75%] border-4 px-4 py-2 font-mono text-sm transition-all hover:shadow-md ${
                          isMine
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-secondary bg-secondary text-secondary-foreground shadow-sm"
                        }`}
                      >
                        {message.content}
                      </div>
                      {isMine ? (
                        <button
                          type="button"
                          className="border-2 border-destructive/30 bg-destructive/10 px-2 py-1 font-mono text-xs font-semibold text-destructive transition-all hover:bg-destructive/20 hover:shadow-sm disabled:opacity-50"
                          onClick={() => handleDelete(message._id)}
                          disabled={deletingId === message._id}
                          aria-label="Delete message"
                        >
                          {deletingId === message._id ? "..." : "Delete"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
            {isTyping ? (
              <p className="font-mono text-xs text-muted-foreground animate-pulse">
                ● Typing...
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* Input area - fixed at bottom */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Write a message..."
            value={messageInput}
            onChange={(event) => handleTyping(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSend();
              }
            }}
            className="border-4 border-border font-mono shadow-md"
          />
          <Button
            type="button"
            onClick={handleSend}
            className="border-4 border-border font-mono text-base font-bold shadow-lg transition-all hover:shadow-xl hover:translate-x-[-1px] hover:translate-y-[-1px]"
          >
            Send →
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default Chat;
