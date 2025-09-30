import { useParams, useLocation } from "wouter";
import { useCommunity } from '@/contexts/SupabaseCommunityContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getWorkshop, 
  joinWorkshop, 
  leaveWorkshop, 
  isWorkshopMember, 
  getWorkshopMessages, 
  sendWorkshopMessage,
  getWorkshopMembers 
} from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Users, Send, Loader2 } from "lucide-react";

export default function WorkshopDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { currentUser } = useCommunity();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");

  // Fetch workshop directly from database
  const { data: ws, isLoading, error } = useQuery({
    queryKey: ['workshop', id],
    queryFn: () => getWorkshop(id!),
    enabled: !!id,
  });

  // Fetch workshop members
  const { data: members = [] } = useQuery({
    queryKey: ['workshop-members', id],
    queryFn: () => getWorkshopMembers(id!),
    enabled: !!id,
  });

  // Check if current user is a member
  const { data: isMember = false } = useQuery({
    queryKey: ['workshop-membership', id, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !id) return false;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      return await isWorkshopMember(id, user.id);
    },
    enabled: !!id && !!currentUser,
  });

  // Fetch workshop messages (only if user is a member)
  const { data: messages = [] } = useQuery({
    queryKey: ['workshop-messages', id],
    queryFn: async () => {
      console.log('🔄 Fetching messages for workshop:', id);
      const result = await getWorkshopMessages(id!);
      console.log('📝 Messages fetched:', result);
      return result;
    },
    enabled: !!id && isMember,
    refetchInterval: 3000, // Refresh every 3 seconds for real-time feel
  });

  // Join workshop mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !id) throw new Error('Missing data');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      return await joinWorkshop(id, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshop-membership', id] });
      queryClient.invalidateQueries({ queryKey: ['workshop-members', id] });
      queryClient.invalidateQueries({ queryKey: ['workshop', id] });
      toast({
        title: "Joined workshop! 🎉",
        description: "You can now participate in discussions and collaborate with other members.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join workshop",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Leave workshop mutation
  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !id) throw new Error('Missing data');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      return await leaveWorkshop(id, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshop-membership', id] });
      queryClient.invalidateQueries({ queryKey: ['workshop-members', id] });
      queryClient.invalidateQueries({ queryKey: ['workshop', id] });
      toast({
        title: "Left workshop",
        description: "You have left the workshop.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to leave workshop",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      console.log('🔄 Sending message mutation started');
      if (!currentUser || !id) {
        console.error('❌ Missing data:', { currentUser, id });
        throw new Error('Missing data');
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Not authenticated');
        throw new Error('Not authenticated');
      }
      console.log('✅ Sending message:', { workshopId: id, userId: user.id, message: messageText });
      return await sendWorkshopMessage(id, user.id, messageText);
    },
    onSuccess: (data) => {
      console.log('✅ Message sent successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['workshop-messages', id] });
      setMessage("");
      toast({
        title: "Message sent! 💬",
        description: "Your message has been posted to the workshop chat.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Failed to send message:', error);
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) return <div className="p-6">Loading workshop...</div>;
  if (error || !ws) return <p className="p-6">Workshop not found.</p>;

  const handleJoin = () => joinMutation.mutate();
  const handleLeave = () => leaveMutation.mutate();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    console.log('Sending message:', message.trim());
    sendMessageMutation.mutate(message.trim());
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{ws.title}</h1>
          <p className="text-muted-foreground mt-1">{ws.description}</p>
        </div>
        <div className="flex items-center gap-3">
          {(() => {
            // Find current user's membership data using auth user ID
            const currentUserMembership = members.find(async (member) => {
              if (!currentUser) return false;
              const { data: { user } } = await supabase.auth.getUser();
              return user && member.user_id === user.id;
            });

            // Simple check: if user is member, show appropriate button
            if (isMember) {
              // Check if creator by looking at the workshop creator_id
              const isCreator = (async () => {
                if (!currentUser) return false;
                const { data: { user } } = await supabase.auth.getUser();
                return user && ws.creator_id === user.id;
              })();

              return (
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    ✓ Member
                  </div>
                  <Button variant="outline" onClick={handleLeave} disabled={leaveMutation.isPending}>
                    {leaveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Leave"}
                  </Button>
                </div>
              );
            } else {
              return (
                <Button onClick={handleJoin} disabled={joinMutation.isPending}>
                  {joinMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Workshop"}
                </Button>
              );
            }
          })()}
        </div>
      </div>

      {/* Workshop Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
          <p className="text-lg capitalize">{ws.status}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold text-sm text-muted-foreground">Participants</h3>
          <p className="text-lg">{members.length} participants</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold text-sm text-muted-foreground">Target Words</h3>
          <p className="text-lg">{ws.target_words || 'No limit'}</p>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Workshop Members ({members.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {members.map((member: any) => (
            <div key={member.id} className="flex items-center gap-2 bg-secondary/30 px-3 py-1 rounded-full text-sm">
              {member.user?.avatar_url && (
                <img src={member.user.avatar_url} alt="" className="w-5 h-5 rounded-full" />
              )}
              <span>{member.user?.display_name || member.user?.username || 'Anonymous'}</span>
              {member.role === 'creator' && (
                <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs">Creator</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Section */}
      {isMember ? (
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Collaboration Chat</h2>
            <p className="text-sm text-muted-foreground">Discuss ideas, share progress, and collaborate with fellow writers</p>
          </div>
          
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-3">
            {messages.map((msg: any) => (
              <div key={msg.id} className="flex gap-3">
                {msg.user?.avatar_url && (
                  <img src={msg.user.avatar_url} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{msg.user?.display_name || msg.user?.username || 'Anonymous'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm bg-secondary/30 p-2 rounded">{msg.message}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="Write a message to your fellow writers..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sendMessageMutation.isPending}
              />
              <Button type="submit" disabled={sendMessageMutation.isPending || !message.trim()}>
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-card p-8 rounded-lg border text-center">
          <h3 className="text-lg font-semibold mb-2">Join the Workshop</h3>
          <p className="text-muted-foreground mb-4">
            Join this workshop to participate in discussions, collaborate with other writers, and access exclusive content.
          </p>
          <Button onClick={handleJoin} disabled={joinMutation.isPending}>
            {joinMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Workshop"}
          </Button>
        </div>
      )}
    </div>
  );
}
