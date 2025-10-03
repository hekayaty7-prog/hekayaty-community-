import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Upload, X, User, Calendar, Eye, Star, Palette, Camera, Loader2 } from 'lucide-react';
import backgroundImage from '@/assets/c79d8e3c-1594-4711-97bf-606619c10341.png';
import { uploadImageToCloudinary, validateCloudinaryConfig } from '@/lib/cloudinary';
import { useCommunity } from '@/contexts/SupabaseCommunityContext';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  description: string;
  likes: number;
  comments: number;
  views: number;
  date: string;
  category: string;
  userLiked: boolean;
  reactions: {
    love: number;
    wow: number;
    fire: number;
  };
  userReactions: {
    love: string[]; // Array of user IDs who reacted with love
    wow: string[];  // Array of user IDs who reacted with wow
    fire: string[]; // Array of user IDs who reacted with fire
  };
}

interface NewArtwork {
  title: string;
  artist: string;
  description: string;
  category: string;
}

const ArtGallery = () => {
  const { currentUser } = useCommunity();
  const queryClient = useQueryClient();
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newArtwork, setNewArtwork] = useState<NewArtwork>({
    title: '',
    artist: '',
    description: '',
    category: 'Digital Art'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Local artworks state (will be replaced with database data)
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  // Fetch artworks from database
  const { data: dbArtworks = [], isLoading } = useQuery({
    queryKey: ['artworks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          *,
          artist:storyweave_profiles!artworks_artist_id_fkey(username, display_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching artworks:', error);
        throw error;
      }

      // Transform data to match component interface
      return data.map((artwork: any) => ({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist?.display_name || artwork.artist?.username || 'Unknown Artist',
        imageUrl: artwork.image_url,
        description: artwork.description || '',
        likes: artwork.like_count || 0,
        comments: artwork.comment_count || 0,
        views: artwork.view_count || 0,
        date: new Date(artwork.created_at).toISOString().split('T')[0],
        category: artwork.medium || 'Digital Art',
        userLiked: false,
        reactions: { love: 0, wow: 0, fire: 0 },
        userReactions: { love: [], wow: [], fire: [] }
      }));
    },
    enabled: !!currentUser,
    retry: 1
  });

  // Upload artwork mutation
  const uploadMutation = useMutation({
    mutationFn: async (artworkData: {
      title: string;
      description: string;
      image_url: string;
      category: string;
    }) => {
      if (!currentUser) throw new Error('User not authenticated');

      // Get the user's storyweave profile ID
      const { data: profile, error: profileError } = await supabase
        .from('storyweave_profiles')
        .select('id')
        .eq('hekayaty_user_id', currentUser.id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found. Please complete your profile setup.');
      }

      const { data, error } = await supabase
        .from('artworks')
        .insert({
          title: artworkData.title,
          description: artworkData.description,
          image_url: artworkData.image_url,
          artist_id: profile.id,
          medium: artworkData.category,
          tags: [],
          status: 'published'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Add to local state immediately
      const newArtwork: Artwork = {
        id: data.id,
        title: data.title,
        artist: currentUser?.display_name || currentUser?.username || 'Unknown Artist',
        imageUrl: data.image_url,
        description: data.description || '',
        likes: 0,
        comments: 0,
        views: 0,
        date: new Date(data.created_at).toISOString().split('T')[0],
        category: data.medium || 'Digital Art',
        userLiked: false,
        reactions: { love: 0, wow: 0, fire: 0 },
        userReactions: { love: [], wow: [], fire: [] }
      };
      setArtworks(prev => [newArtwork, ...prev]);
      
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      resetUploadModal();
      setIsUploading(false);
      alert('Artwork uploaded successfully!');
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsUploading(false);
    }
  });

  // Load database artworks into local state
  useEffect(() => {
    if (dbArtworks.length > 0) {
      setArtworks(dbArtworks);
    }
  }, [dbArtworks]);

  const categories = ['Digital Art', 'Painting', 'Photography', 'Sculpture', 'Abstract', 'Portrait', 'Landscape'];
  const reactionEmojis = {
    love: '❤️',
    wow: '😮',
    fire: '🔥'
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !newArtwork.title) {
      alert('Please fill in all required fields and select an image');
      return;
    }

    if (!currentUser) {
      alert('Please sign in to upload artwork');
      return;
    }

    // Validate Cloudinary configuration
    if (!validateCloudinaryConfig()) {
      alert('Cloudinary is not properly configured');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Cloudinary
      const cloudinaryResult = await uploadImageToCloudinary(selectedFile, 'gallery');
      
      // Save to database using mutation
      uploadMutation.mutate({
        title: newArtwork.title,
        description: newArtwork.description,
        image_url: cloudinaryResult.secure_url,
        category: newArtwork.category
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsUploading(false);
    }
  };

  const resetUploadModal = () => {
    setShowUploadModal(false);
    setUploadPreview(null);
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setNewArtwork({
      title: '',
      artist: '',
      description: '',
      category: 'Digital Art'
    });
  };

  const handleLike = (id: string) => {
    if (!currentUser) {
      alert('Please sign in to like artworks');
      return;
    }
    alert('Like functionality will be implemented soon');
  };

  const handleReaction = (id: string, reactionType: keyof typeof reactionEmojis) => {
    if (!currentUser) {
      alert('Please sign in to react to artworks');
      return;
    }
    alert('Reaction functionality will be implemented soon');
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`
      }}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Palette className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ArtisticHub
              </h1>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Art</span>
            </button>
          </div>
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm mb-2">{artwork.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {artwork.category}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArtwork(artwork)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
                >
                  <Eye className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{artwork.title}</h3>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <User className="w-4 h-4 mr-1" />
                  <span className="mr-3">{artwork.artist}</span>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{artwork.date}</span>
                </div>

                {/* Reactions */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex space-x-1">
                    {Object.entries(reactionEmojis).map(([type, emoji]) => {
                      const currentUserId = 'user-123'; // Mock user ID
                      const hasUserReacted = artwork.userReactions[type as keyof typeof reactionEmojis].includes(currentUserId);
                      
                      return (
                        <button
                          key={type}
                          onClick={() => handleReaction(artwork.id, type as keyof typeof reactionEmojis)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-colors ${
                            hasUserReacted 
                              ? 'bg-purple-200 border-2 border-purple-400 text-purple-800' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className="text-xs">{artwork.reactions[type as keyof typeof reactionEmojis]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between text-gray-600">
                  <button
                    onClick={() => handleLike(artwork.id)}
                    className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                      artwork.userLiked ? 'text-red-500' : ''
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${artwork.userLiked ? 'fill-current' : ''}` } />
                    <span className="text-sm">{artwork.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{artwork.comments}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{artwork.views}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Upload Your Artwork</h2>
                <button
                  onClick={resetUploadModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Image Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-colors bg-gray-50"
              >
                {uploadPreview ? (
                  <div className="relative">
                    <img
                      src={uploadPreview}
                      alt="Preview"
                      className="max-w-full h-64 mx-auto rounded-lg object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload your artwork</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Form Fields */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newArtwork.title}
                    onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-orange-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter artwork title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Artist Name *
                  </label>
                  <input
                    type="text"
                    value={newArtwork.artist}
                    onChange={(e) => setNewArtwork({ ...newArtwork, artist: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-orange-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newArtwork.description}
                    onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-orange-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tell us about your artwork"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newArtwork.category}
                    onChange={(e) => setNewArtwork({ ...newArtwork, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-orange-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={resetUploadModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !newArtwork.title || !newArtwork.artist || isUploading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Artwork'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Artwork Detail Modal */}
      {selectedArtwork && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setSelectedArtwork(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full z-10 hover:bg-white"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
              <img
                src={selectedArtwork.imageUrl}
                alt={selectedArtwork.title}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>
            <div className="p-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedArtwork.title}</h2>
              <div className="flex items-center text-gray-600 mb-4">
                <User className="w-5 h-5 mr-2" />
                <span className="mr-4">{selectedArtwork.artist}</span>
                <Calendar className="w-5 h-5 mr-2" />
                <span>{selectedArtwork.date}</span>
              </div>
              <p className="text-gray-700 mb-4">{selectedArtwork.description}</p>
              <div className="flex items-center space-x-4">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                  {selectedArtwork.category}
                </span>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Heart className="w-5 h-5" />
                  <span>{selectedArtwork.likes} likes</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Eye className="w-5 h-5" />
                  <span>{selectedArtwork.views} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtGallery;