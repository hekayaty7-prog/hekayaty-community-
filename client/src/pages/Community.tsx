import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { DiscussionPost } from '@/components/DiscussionPost';
import { BookClubPost } from '@/components/BookClubPost';
import { WorkshopPost } from '@/components/WorkshopPost';
import { ArtGalleryPost } from '@/components/ArtGalleryPost';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Image, MessageSquare, Users, BookOpen, Palette, Upload, Loader2 } from 'lucide-react';
import { useCommunity } from '@/contexts/SupabaseCommunityContext';
import { useToast } from '@/hooks/use-toast';

export function Community() {
  const { threads, artworks, workshops, bookClubs, threadsLoading, currentUser, createThread, uploadArt, createWorkshopAction, createBookClubAction } = useCommunity();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('Popular');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  // Post creation modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postType, setPostType] = useState('discussion');
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form states for different post types
  const [discussionForm, setDiscussionForm] = useState({
    title: '',
    content: '',
    category: '',
    images: [] as File[]
  });
  
  const [artworkForm, setArtworkForm] = useState({
    title: '',
    description: '',
    tags: '',
    file: null as File | null
  });
  
  const [workshopForm, setWorkshopForm] = useState({
    title: '',
    description: '',
    genre: '',
    target_words: undefined as number | undefined,
    max_participants: 5 as number
  });
  
  const [bookClubForm, setBookClubForm] = useState({
    name: '',
    description: '',
    current_book_title: '',
    is_private: false
  });

  // Combine all data types into a unified feed
  const allPosts = [
    ...threads.map(thread => ({ ...thread, type: 'discussion' })),
    ...artworks.map(artwork => ({ ...artwork, type: 'art_gallery' })),
    ...workshops.map(workshop => ({ ...workshop, type: 'workshop' })),
    ...bookClubs.map(club => ({ ...club, type: 'book_club' }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Image compression function
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = document.createElement('img') as HTMLImageElement;
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.onload = () => {
        // More aggressive compression for large files
        const maxSize = file.size > 2000000 ? 800 : 1200; // 800px for files > 2MB, 1200px for smaller
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress with better quality settings
        ctx.drawImage(img, 0, 0, width, height);
        
        // More aggressive compression for large files
        const quality = file.size > 5000000 ? 0.6 : file.size > 2000000 ? 0.7 : 0.8;
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
              resolve(compressedFile);
            } else {
              // Fallback to original file if compression fails
              console.warn(`Compression failed for ${file.name}, using original`);
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file upload for artwork
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      try {
        setIsUploading(true);
        const compressedFile = await compressImage(file);
        setArtworkForm(prev => ({ ...prev, file: compressedFile }));
      } catch (error) {
        console.error('Error compressing image:', error);
        toast({
          title: "Error processing image",
          description: "Please try again with a different image",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Handle multiple image uploads for discussions
  const handleDiscussionImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    if (discussionForm.images.length + validFiles.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload up to 5 images per post",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Compress all images with individual error handling
      const compressedFiles: File[] = [];
      for (const file of validFiles) {
        try {
          const compressed = await compressImage(file);
          compressedFiles.push(compressed);
        } catch (error) {
          console.warn(`Failed to compress ${file.name}, using original:`, error);
          compressedFiles.push(file); // Use original file as fallback
        }
      }

      setDiscussionForm(prev => ({ 
        ...prev, 
        images: [...prev.images, ...compressedFiles] 
      }));
    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: "Error processing images",
        description: "Some images may not be compressed. Please try again if needed.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Remove image from discussion
  const removeDiscussionImage = (index: number) => {
    setDiscussionForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Handle post creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      switch (postType) {
        case 'discussion':
          if (!discussionForm.title.trim() || !discussionForm.content.trim()) {
            throw new Error('Title and content are required');
          }
          
          // Upload images to Cloudinary if any are selected
          let imageUrls: string[] = [];
          if (discussionForm.images.length > 0) {
            const { uploadImageToCloudinary } = await import('@/lib/cloudinary');
            const uploadPromises = discussionForm.images.map(file => 
              uploadImageToCloudinary(file, 'discussions')
            );
            const uploadResults = await Promise.all(uploadPromises);
            imageUrls = uploadResults.map(result => result.secure_url);
          }
          
          await createThread({
            title: discussionForm.title,
            content: discussionForm.content,
            images: imageUrls,
            // Don't pass category_id for now since we're using category names, not UUIDs
            // category_id: discussionForm.category || undefined
          });
          setDiscussionForm({ title: '', content: '', category: '', images: [] });
          break;

        case 'artwork':
          if (!artworkForm.title.trim() || !artworkForm.file) {
            throw new Error('Title and image are required');
          }
          await uploadArt({
            title: artworkForm.title,
            description: artworkForm.description || undefined,
            image_file: artworkForm.file,
            tags: artworkForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          });
          setArtworkForm({ title: '', description: '', tags: '', file: null });
          break;

        case 'workshop':
          if (!workshopForm.title.trim()) {
            throw new Error('Workshop title is required');
          }
          await createWorkshopAction({
            title: workshopForm.title,
            description: workshopForm.description || undefined,
            genre: workshopForm.genre || undefined,
            target_words: workshopForm.target_words
          });
          setWorkshopForm({ title: '', description: '', genre: '', target_words: undefined, max_participants: 5 });
          break;

        case 'book_club':
          if (!bookClubForm.name.trim()) {
            throw new Error('Club name is required');
          }
          await createBookClubAction({
            name: bookClubForm.name,
            description: bookClubForm.description || undefined,
            current_book_title: bookClubForm.current_book_title || undefined,
            is_private: bookClubForm.is_private
          });
          setBookClubForm({ name: '', description: '', current_book_title: '', is_private: false });
          break;
      }

      toast({
        title: "Post created successfully!",
        description: "Your post has been shared with the community"
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Failed to create post",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const renderPost = (post: any) => {
    switch (post.type) {
      case 'discussion':
        return <DiscussionPost key={post.id} post={post} />;
      case 'book_club':
        return <BookClubPost key={post.id} post={post} />;
      case 'workshop':
        return <WorkshopPost key={post.id} post={post} />;
      case 'art_gallery':
        return <ArtGalleryPost key={post.id} post={post} />;
      default:
        return <DiscussionPost key={post.id} post={post} />;
    }
  };

  if (threadsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="community-page">
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 p-3 sm:p-4 lg:p-6 relative">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            
            {/* Welcome Banner */}
            <div 
              className="relative overflow-hidden rounded-xl p-4 sm:p-6 lg:p-8 text-white bg-black/30 backdrop-blur-sm" 
              data-testid="welcome-banner"
            >
              <div className="relative z-10">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" data-testid="welcome-title">
                  Welcome to Hekayaty Community!
                </h1>
                <p className="text-base sm:text-lg opacity-90 mb-4 sm:mb-6" data-testid="welcome-description">
                  Connect with fellow storytellers, join creative discussions, and bring your stories to life together.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4" data-testid="welcome-actions">
                  <Button size="lg" className="w-full sm:w-auto touch-manipulation" data-testid="button-explore">
                    Explore Discussions
                  </Button>
                </div>
              </div>
            </div>

            {/* Activity Feed Navigation */}
            <div className="flex items-center justify-between" data-testid="activity-navigation">
              <div className="flex space-x-6">
                {['Popular', 'Recent', 'Following', 'Trending'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    data-testid={`tab-${tab.toLowerCase()}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48" data-testid="category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Categories">All Categories</SelectItem>
                    <SelectItem value="Fantasy">Fantasy</SelectItem>
                    <SelectItem value="Romance">Romance</SelectItem>
                    <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                    <SelectItem value="Mystery">Mystery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Floating Create Post Button */}
            {allPosts.length > 0 && (
              <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="rounded-full w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl">
                      <Plus className="h-6 w-6" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto mx-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl sm:text-2xl">Create New Post</DialogTitle>
                      <DialogDescription>
                        Share your thoughts, artwork, or start a discussion with the community
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs value={postType} onValueChange={setPostType} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
                        <TabsTrigger value="discussion" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">Discussion</span>
                          <span className="xs:hidden">Talk</span>
                        </TabsTrigger>
                        <TabsTrigger value="artwork" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">Artwork</span>
                          <span className="xs:hidden">Art</span>
                        </TabsTrigger>
                        <TabsTrigger value="workshop" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">Workshop</span>
                          <span className="xs:hidden">Work</span>
                        </TabsTrigger>
                        <TabsTrigger value="book_club" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">Book Club</span>
                          <span className="xs:hidden">Club</span>
                        </TabsTrigger>
                      </TabsList>

                      <form onSubmit={handleCreatePost} className="mt-6">
                        <TabsContent value="discussion" className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Title *</label>
                            <Input
                              value={discussionForm.title}
                              onChange={(e) => setDiscussionForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="What would you like to discuss?"
                              className="mt-1"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Content *</label>
                            <Textarea
                              value={discussionForm.content}
                              onChange={(e) => setDiscussionForm(prev => ({ ...prev, content: e.target.value }))}
                              placeholder="Share your thoughts, ask questions, or start a conversation..."
                              rows={6}
                              className="mt-1"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Category</label>
                            <Select value={discussionForm.category} onValueChange={(value) => setDiscussionForm(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General Discussion</SelectItem>
                                <SelectItem value="writing-tips">Writing Tips</SelectItem>
                                <SelectItem value="book-recommendations">Book Recommendations</SelectItem>
                                <SelectItem value="feedback">Feedback & Critique</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Image Upload for Discussions */}
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Add Photos (Optional)</label>
                            <div className="mt-1">
                              <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleDiscussionImagesChange}
                                className="mb-3"
                              />
                              <p className="text-xs text-gray-500 mb-3">
                                Upload up to 5 images (max 10MB each) - Images will be automatically compressed for faster upload
                              </p>
                              
                              {isUploading && (
                                <div className="flex items-center gap-2 text-sm text-blue-600 mb-3">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing images...
                                </div>
                              )}
                              
                              {/* Image Previews */}
                              {discussionForm.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {discussionForm.images.map((file, index) => (
                                    <div key={index} className="relative group">
                                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                                        <img
                                          src={URL.createObjectURL(file)}
                                          alt={`Preview ${index + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeDiscussionImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                      >
                                        ×
                                      </button>
                                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                        {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="artwork" className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Title *</label>
                            <Input
                              value={artworkForm.title}
                              onChange={(e) => setArtworkForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Give your artwork a title"
                              className="mt-1"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Description</label>
                            <Textarea
                              value={artworkForm.description}
                              onChange={(e) => setArtworkForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Describe your artwork, inspiration, or process..."
                              rows={4}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Artwork Image *</label>
                            <div className="mt-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="mb-3"
                                required
                              />
                              <p className="text-xs text-gray-500 mb-3">
                                Upload your artwork (max 10MB) - Images will be automatically compressed for faster upload
                              </p>
                              
                              {isUploading && (
                                <div className="flex items-center gap-2 text-sm text-blue-600 mb-3">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing image...
                                </div>
                              )}
                              
                              {artworkForm.file && (
                                <div className="relative">
                                  <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 shadow-lg">
                                    <img
                                      src={URL.createObjectURL(artworkForm.file)}
                                      alt="Artwork Preview"
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                                      🎨 Your Artwork
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setArtworkForm(prev => ({ ...prev, file: null }))}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Tags</label>
                            <Input
                              value={artworkForm.tags}
                              onChange={(e) => setArtworkForm(prev => ({ ...prev, tags: e.target.value }))}
                              placeholder="fantasy, character-art, book-cover (comma-separated)"
                              className="mt-1"
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="workshop" className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Workshop Title *</label>
                            <Input
                              value={workshopForm.title}
                              onChange={(e) => setWorkshopForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="What's your workshop about?"
                              className="mt-1"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Description</label>
                            <Textarea
                              value={workshopForm.description}
                              onChange={(e) => setWorkshopForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Describe your workshop goals, format, and what participants will learn..."
                              rows={4}
                              className="mt-1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Genre</label>
                              <Input
                                value={workshopForm.genre}
                                onChange={(e) => setWorkshopForm(prev => ({ ...prev, genre: e.target.value }))}
                                placeholder="Fantasy, Romance, Sci-Fi..."
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Target Words</label>
                              <Input
                                type="number"
                                value={workshopForm.target_words || ''}
                                onChange={(e) => setWorkshopForm(prev => ({ ...prev, target_words: e.target.value ? Number(e.target.value) : undefined }))}
                                placeholder="50000"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="book_club" className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Club Name *</label>
                            <Input
                              value={bookClubForm.name}
                              onChange={(e) => setBookClubForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="What's your book club called?"
                              className="mt-1"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Description</label>
                            <Textarea
                              value={bookClubForm.description}
                              onChange={(e) => setBookClubForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Describe your book club's focus, reading preferences, and meeting style..."
                              rows={4}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Current Book</label>
                            <Input
                              value={bookClubForm.current_book_title}
                              onChange={(e) => setBookClubForm(prev => ({ ...prev, current_book_title: e.target.value }))}
                              placeholder="What book are you currently reading?"
                              className="mt-1"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="private-club-fab"
                              checked={bookClubForm.is_private}
                              onChange={(e) => setBookClubForm(prev => ({ ...prev, is_private: e.target.checked }))}
                              className="rounded"
                            />
                            <label htmlFor="private-club-fab" className="text-sm font-medium">
                              Make this a private club (invite only)
                            </label>
                          </div>
                        </TabsContent>

                        <div className="flex gap-3 mt-6">
                          <Button type="submit" disabled={isCreating} className="flex-1">
                            {isCreating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Create Post
                              </>
                            )}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Discussion Posts Feed */}
            <div className="space-y-6" data-testid="posts-feed">
              {allPosts.length > 0 ? (
                allPosts.map(renderPost)
              ) : (
                <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to start a discussion, share artwork, or create a workshop!
                  </p>
                  <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Your First Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Create New Post</DialogTitle>
                        <DialogDescription>
                          Share your thoughts, artwork, or start a discussion with the community
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Tabs value={postType} onValueChange={setPostType} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="discussion" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Discussion
                          </TabsTrigger>
                          <TabsTrigger value="artwork" className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Artwork
                          </TabsTrigger>
                          <TabsTrigger value="workshop" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Workshop
                          </TabsTrigger>
                          <TabsTrigger value="book_club" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Book Club
                          </TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleCreatePost} className="mt-6">
                          <TabsContent value="discussion" className="space-y-4">
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Title *</label>
                              <Input
                                value={discussionForm.title}
                                onChange={(e) => setDiscussionForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="What would you like to discuss?"
                                className="mt-1"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Content *</label>
                              <Textarea
                                value={discussionForm.content}
                                onChange={(e) => setDiscussionForm(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Share your thoughts, ask questions, or start a conversation..."
                                rows={6}
                                className="mt-1"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Category</label>
                              <Select value={discussionForm.category} onValueChange={(value) => setDiscussionForm(prev => ({ ...prev, category: value }))}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">General Discussion</SelectItem>
                                  <SelectItem value="writing-tips">Writing Tips</SelectItem>
                                  <SelectItem value="book-recommendations">Book Recommendations</SelectItem>
                                  <SelectItem value="feedback">Feedback & Critique</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Image Upload for Discussions */}
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Add Photos (Optional)</label>
                              <div className="mt-1">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleDiscussionImagesChange}
                                  className="mb-3"
                                />
                                <p className="text-xs text-gray-500 mb-3">
                                  Upload up to 5 images (max 10MB each) - Images will be automatically compressed for faster upload
                                </p>
                                
                                {isUploading && (
                                  <div className="flex items-center gap-2 text-sm text-blue-600 mb-3">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing images...
                                  </div>
                                )}
                                
                                {/* Image Previews */}
                                {discussionForm.images.length > 0 && (
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {discussionForm.images.map((file, index) => (
                                      <div key={index} className="relative group">
                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                                          <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => removeDiscussionImage(index)}
                                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                        >
                                          ×
                                        </button>
                                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                          {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="artwork" className="space-y-4">
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Title *</label>
                              <Input
                                value={artworkForm.title}
                                onChange={(e) => setArtworkForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Give your artwork a title"
                                className="mt-1"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Description</label>
                              <Textarea
                                value={artworkForm.description}
                                onChange={(e) => setArtworkForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your artwork, inspiration, or process..."
                                rows={4}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Artwork Image *</label>
                              <div className="mt-1">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  className="mb-3"
                                  required
                                />
                                <p className="text-xs text-gray-500 mb-3">
                                  Upload your artwork (max 10MB)
                                </p>
                                
                                {artworkForm.file && (
                                  <div className="relative">
                                    <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 shadow-lg">
                                      <img
                                        src={URL.createObjectURL(artworkForm.file)}
                                        alt="Artwork Preview"
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                                        🎨 Your Artwork
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setArtworkForm(prev => ({ ...prev, file: null }))}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Tags</label>
                              <Input
                                value={artworkForm.tags}
                                onChange={(e) => setArtworkForm(prev => ({ ...prev, tags: e.target.value }))}
                                placeholder="fantasy, character-art, book-cover (comma-separated)"
                                className="mt-1"
                              />
                            </div>
                          </TabsContent>

                          <TabsContent value="workshop" className="space-y-4">
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Workshop Title *</label>
                              <Input
                                value={workshopForm.title}
                                onChange={(e) => setWorkshopForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="What's your workshop about?"
                                className="mt-1"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Description</label>
                              <Textarea
                                value={workshopForm.description}
                                onChange={(e) => setWorkshopForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your workshop goals, format, and what participants will learn..."
                                rows={4}
                                className="mt-1"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-semibold text-gray-700">Genre</label>
                                <Input
                                  value={workshopForm.genre}
                                  onChange={(e) => setWorkshopForm(prev => ({ ...prev, genre: e.target.value }))}
                                  placeholder="Fantasy, Romance, Sci-Fi..."
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-700">Target Words</label>
                                <Input
                                  type="number"
                                  value={workshopForm.target_words || ''}
                                  onChange={(e) => setWorkshopForm(prev => ({ ...prev, target_words: e.target.value ? Number(e.target.value) : undefined }))}
                                  placeholder="50000"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Max Participants</label>
                              <Input
                                type="number"
                                value={workshopForm.max_participants}
                                onChange={(e) => setWorkshopForm(prev => ({ ...prev, max_participants: Number(e.target.value) || 5 }))}
                                min="2"
                                max="20"
                                className="mt-1"
                              />
                            </div>
                          </TabsContent>

                          <TabsContent value="book_club" className="space-y-4">
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Club Name *</label>
                              <Input
                                value={bookClubForm.name}
                                onChange={(e) => setBookClubForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="What's your book club called?"
                                className="mt-1"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Description</label>
                              <Textarea
                                value={bookClubForm.description}
                                onChange={(e) => setBookClubForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your book club's focus, reading preferences, and meeting style..."
                                rows={4}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">Current Book</label>
                              <Input
                                value={bookClubForm.current_book_title}
                                onChange={(e) => setBookClubForm(prev => ({ ...prev, current_book_title: e.target.value }))}
                                placeholder="What book are you currently reading?"
                                className="mt-1"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="private-club"
                                checked={bookClubForm.is_private}
                                onChange={(e) => setBookClubForm(prev => ({ ...prev, is_private: e.target.checked }))}
                                className="rounded"
                              />
                              <label htmlFor="private-club" className="text-sm font-medium">
                                Make this a private club (invite only)
                              </label>
                            </div>
                          </TabsContent>

                          <div className="flex gap-3 mt-6">
                            <Button type="submit" disabled={isCreating} className="flex-1">
                              {isCreating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Create Post
                                </>
                              )}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>

            {/* Load More */}
            <div className="text-center py-8" data-testid="load-more-section">
              <Button variant="secondary" size="lg" data-testid="button-load-more">
                Load More Posts
              </Button>
            </div>

          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
}
