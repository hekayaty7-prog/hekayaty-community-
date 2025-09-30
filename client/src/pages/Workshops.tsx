import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCommunity } from '@/contexts/SupabaseCommunityContext';
import { Badge } from "@/components/ui/badge";

export default function Workshops() {
  const { workshops, workshopsLoading } = useCommunity();
  
  // Placeholder for features not yet implemented
  const joinedWorkshops = new Set();
  const [, navigate] = useLocation();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Writing Workshops</h1>
        <Button asChild>
          <Link href="/workshops/new">Create Workshop</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {workshops.map((ws) => (
          <div
            key={ws.id}
            className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/40 cursor-pointer"
            onClick={() => navigate(`/workshops/${ws.id}`)}
          >
            <div>
              <h2 className="font-semibold text-lg">{ws.title}</h2>
              <p className="text-sm text-muted-foreground line-clamp-2">{ws.description}</p>
            </div>
            <div className="space-y-1 text-right">
              <Badge>
                {ws.current_participants ?? 0} writers
              </Badge>
              {joinedWorkshops.has(ws.id) && <span className="text-xs text-primary">Joined</span>}
            </div>
          </div>
        ))}
        {workshops.length === 0 && <p>No workshops yet. Create one!</p>}
      </div>
    </div>
  );
}
