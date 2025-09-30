import { useState } from "react";
import { useLocation } from "wouter";
import { useCommunity } from '@/contexts/SupabaseCommunityContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewWorkshop() {
  const { createWorkshopAction, currentUser } = useCommunity();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [targetWords, setTargetWords] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    if (!currentUser) {
      alert('Please sign in to create a workshop');
      return;
    }
    
    setIsLoading(true);
    try {
      const ws = await createWorkshopAction({
        title,
        description,
        genre,
        target_words: targetWords,
        timeline: "6 months",
      });
      navigate(`/workshops/${ws.id}`);
    } catch (error) {
      console.error('Error creating workshop:', error);
      alert('Failed to create workshop. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Create New Workshop</h1>
        <p className="text-gray-600 mb-4">You need to be signed in to create a workshop.</p>
        <Button onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Create New Workshop</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Workshop Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Genre</label>
          <Input value={genre} onChange={(e) => setGenre(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Target Words</label>
          <Input
            type="number"
            value={targetWords ?? ""}
            onChange={(e) => setTargetWords(e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Workshop...' : 'Create Workshop'}
        </Button>
      </form>
    </div>
  );
}
