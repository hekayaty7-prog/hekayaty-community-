import { useState } from "react";
import { useLocation } from "wouter";
import { useCommunity } from '@/contexts/SupabaseCommunityContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function NewClub() {
  const { createBookClubAction, currentUser } = useCommunity();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentBook, setCurrentBook] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    if (!currentUser) {
      alert('Please sign in to create a book club');
      return;
    }
    
    setIsLoading(true);
    try {
      const club = await createBookClubAction({
        name,
        description,
        current_book_title: currentBook,
        is_private: isPrivate,
      });
      navigate(`/clubs/${club.id}`);
    } catch (error) {
      console.error('Error creating book club:', error);
      alert('Failed to create book club. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Create New Book Club</h1>
        <p className="text-gray-600 mb-4">You need to be signed in to create a book club.</p>
        <Button onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Create New Book Club</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Club Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
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
          <label className="block text-sm font-medium mb-1">Current Book (optional)</label>
          <Input
            value={currentBook}
            onChange={(e) => setCurrentBook(e.target.value)}
            placeholder="Enter the book title you're currently reading"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="private"
            checked={isPrivate}
            onCheckedChange={(checked) => setIsPrivate(checked === true)}
          />
          <label htmlFor="private" className="text-sm font-medium">
            Make this a private club (invite only)
          </label>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Club...' : 'Create Club'}
        </Button>
      </form>
    </div>
  );
}
