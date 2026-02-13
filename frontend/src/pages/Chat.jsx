import { useParams } from "react-router-dom";

const Chat = () => {
  const { matchId } = useParams();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Chat</h1>
        <p className="mt-2 text-muted-foreground">Active match: {matchId}</p>
      </div>
    </div>
  );
};

export default Chat;
