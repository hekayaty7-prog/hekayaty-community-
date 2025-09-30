import { useParams, useLocation } from "wouter";
import { useCommunity } from '@/contexts/SupabaseCommunityContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const { bookClubs } = useCommunity();
  
  // Placeholder functions for features not yet implemented
  const joinedClubs = new Set();
  const joinBookClub = (clubId: string) => console.log('Join club:', clubId);
  const club = bookClubs.find((c) => c.id === id);
  const isMember = joinedClubs.has(id);
  const [, navigate] = useLocation();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  if (!club) return <p className="p-6">Club not found.</p>;

  const handleJoin = () => joinBookClub(id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessages((prev) => [...prev, message.trim()]);
    setMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{club.name}</h1>
        {!isMember && <Button onClick={handleJoin}>Join Club</Button>}
      </div>
      <p className="text-muted-foreground">{club.description}</p>
      <p className="text-sm text-muted-foreground">Current book: {club.current_book?.title || 'No book selected'}</p>

      {isMember ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Club Discussion</h2>
          <div className="border border-border rounded-lg p-4 h-64 overflow-y-auto bg-card space-y-2">
            {messages.map((m, idx) => (
              <div key={idx} className="text-sm bg-secondary/30 p-2 rounded">
                {m}
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            )}
          </div>
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="Write a message…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      ) : (
        <p className="text-muted-foreground">Join the club to participate in discussions.</p>
      )}
      <Button variant="secondary" onClick={() => navigate("/clubs")}>Back to Clubs</Button>
    </div>
  );
}
