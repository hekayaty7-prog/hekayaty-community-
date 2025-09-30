import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCommunity } from '@/contexts/SupabaseCommunityContext';
import { Badge } from "@/components/ui/badge";

export default function BookClubs() {
  const { bookClubs, bookClubsLoading } = useCommunity();
  
  // Placeholder for features not yet implemented
  const joinedClubs = new Set();
  const [, navigate] = useLocation();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Book Clubs</h1>
        <Button asChild>
          <Link href="/clubs/new">Create Club</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {bookClubs.map((club) => (
          <div
            key={club.id}
            className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/40 cursor-pointer"
            onClick={() => navigate(`/clubs/${club.id}`)}
          >
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{club.name}</h2>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{club.description}</p>
              {club.current_book?.title && (
                <p className="text-xs text-blue-600 font-medium">
                  📖 Currently reading: {club.current_book.title}
                </p>
              )}
              {club.current_book_title && !club.current_book?.title && (
                <p className="text-xs text-blue-600 font-medium">
                  📖 Currently reading: {club.current_book_title}
                </p>
              )}
            </div>
            <div className="space-y-1 text-right">
              <Badge variant={club.is_private ? "secondary" : "default"}>
                {club.current_member_count} members
              </Badge>
              {club.is_private && (
                <div className="text-xs text-gray-500">🔒 Private</div>
              )}
              {joinedClubs.has(club.id) && <span className="text-xs text-primary">Joined</span>}
            </div>
          </div>
        ))}
        {bookClubs.length === 0 && <p>No clubs yet. Create one!</p>}
      </div>
    </div>
  );
}
