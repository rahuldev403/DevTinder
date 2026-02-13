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
      subtitle={`Match: ${matchId}`}
      actions={
        <div className="text-sm text-muted-foreground">
          {otherUserId
            ? otherUserOnline
              ? "Online"
              : "Offline"
            : "Status loading..."}
        </div>
      }
    >
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <Card className="mb-4">
        <CardContent className="flex max-h-[420px] flex-col gap-3 overflow-y-auto p-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No messages yet. Say hello.
            </p>
          ) : (
            messages.map((message) => {
              const isMine = message.senderId === currentUserId;
              return (
                <div
                  key={message._id}
                  className={`flex items-start gap-2 ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      isMine
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                  {isMine ? (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleDelete(message._id)}
                      disabled={deletingId === message._id}
                      aria-label="Delete message"
                    >
                      {deletingId === message._id ? "..." : "Delete"}
                    </button>
                  ) : null}
                </div>
              );
            })
          )}
          {isTyping ? (
            <p className="text-xs text-muted-foreground">Typing...</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
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
        />
        <Button type="button" onClick={handleSend}>
          Send
        </Button>
      </div>
    </AppShell>
  );
};

export default Chat;
