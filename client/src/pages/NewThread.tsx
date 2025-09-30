import { useState, useRef } from "react";
import { useThreads } from "@/hooks/useThreads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { ImagePlus, X, Loader2 } from "lucide-react";

export default function NewThread() {
  const { createThread } = useThreads();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
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
            const compressedFile = new File([blob!], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Check for oversized files
    const oversizedFiles = imageFiles.filter(file => file.size > 10000000); // 10MB limit
    if (oversizedFiles.length > 0) {
      alert(`Some files are too large (>10MB): ${oversizedFiles.map(f => f.name).join(', ')}. Please choose smaller images.`);
      return;
    }
    
    if (imageFiles.length > 0) {
      // Show loading state
      setIsUploadingImages(true);
      
      try {
        // Show file sizes before compression
        imageFiles.forEach(file => {
          console.log(`Original ${file.name}: ${(file.size / 1024).toFixed(0)}KB`);
        });
        
        // Compress images for faster upload
        const compressedFiles = await Promise.all(
          imageFiles.map(file => compressImage(file))
        );
        
        setSelectedImages(prev => [...prev, ...compressedFiles]);
        
        // Create previews
        compressedFiles.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreviews(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        });
      } catch (error) {
        console.error('Error compressing images:', error);
        alert('Error processing images. Please try again.');
      } finally {
        setIsUploadingImages(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    setIsUploadingImages(true);
    setUploadProgress(0);
    
    try {
      let imageUrls: string[] = [];
      
      // Upload images to Cloudinary if any are selected
      if (selectedImages.length > 0) {
        setUploadProgress(10);
        
        // Upload images one by one with progress updates
        for (let i = 0; i < selectedImages.length; i++) {
          const file = selectedImages[i];
          const result = await uploadImageToCloudinary(file, 'threads');
          imageUrls.push(result.secure_url);
          
          // Update progress (10% to 80% for uploads)
          const progress = 10 + ((i + 1) / selectedImages.length) * 70;
          setUploadProgress(progress);
        }
      }

      setUploadProgress(90);
      
      // Create thread with images
      await createThread.mutateAsync({ 
        title, 
        content, 
        userId: "anon",
        images: imageUrls 
      });
      
      setUploadProgress(100);
      
      // Small delay to show completion
      setTimeout(() => {
        window.location.href = "/threads";
      }, 500);
      
    } catch (error) {
      console.error('Failed to create thread:', error);
      alert('Failed to create thread. Please try again.');
    } finally {
      setIsUploadingImages(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">New Thread</h1>
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
      />
      
      {/* Image Upload Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <ImagePlus className="w-4 h-4" />
            Add Photos
          </Button>
          {selectedImages.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <span>{selectedImages.length} image(s) selected</span>
              <span className="ml-2 text-green-600">
                (Total: {(selectedImages.reduce((sum, file) => sum + file.size, 0) / 1024).toFixed(0)}KB)
              </span>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
        
        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Button 
        onClick={submit} 
        disabled={createThread.isPending || isUploadingImages}
        className="flex items-center gap-2 relative"
      >
        {isUploadingImages ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {uploadProgress > 0 ? (
              `Uploading... ${Math.round(uploadProgress)}%`
            ) : (
              "Processing Images..."
            )}
          </>
        ) : createThread.isPending ? (
          "Creating…"
        ) : (
          "Post"
        )}
      </Button>
      
      {/* Progress Bar */}
      {isUploadingImages && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
