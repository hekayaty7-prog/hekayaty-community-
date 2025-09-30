import { ENV } from './env';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
}

export interface CloudinaryError {
  message: string;
  name: string;
  http_code: number;
}

/**
 * Upload an image file to Cloudinary
 * @param file - The image file to upload
 * @param folder - Optional folder name (defaults to env folder)
 * @returns Promise with upload result
 */
export async function uploadImageToCloudinary(
  file: File,
  folder?: string
): Promise<CloudinaryUploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', ENV.VITE_CLOUDINARY_UPLOAD_PRESET);
    
    // Add folder if specified
    const uploadFolder = folder || ENV.VITE_CLOUDINARY_FOLDER;
    if (uploadFolder) {
      formData.append('folder', uploadFolder);
    }

    // Add additional parameters
    formData.append('resource_type', 'image');
    formData.append('quality', 'auto');
    formData.append('fetch_format', 'auto');

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${ENV.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const result: CloudinaryUploadResult = await response.json();
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Generate optimized image URL with transformations
 * @param publicId - Cloudinary public ID
 * @param transformations - Optional transformations
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  transformations?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
): string {
  const baseUrl = `https://res.cloudinary.com/${ENV.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  if (!transformations) {
    return `${baseUrl}/${publicId}`;
  }

  const params: string[] = [];
  
  if (transformations.width) params.push(`w_${transformations.width}`);
  if (transformations.height) params.push(`h_${transformations.height}`);
  if (transformations.crop) params.push(`c_${transformations.crop}`);
  if (transformations.quality) params.push(`q_${transformations.quality}`);
  if (transformations.format) params.push(`f_${transformations.format}`);

  const transformString = params.length > 0 ? `${params.join(',')}` : '';
  
  return `${baseUrl}/${transformString}/${publicId}`;
}

/**
 * Delete an image from Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns Promise with deletion result
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    // Note: Deletion requires server-side implementation with API secret
    // This is a placeholder for the client-side interface
    console.warn('Image deletion should be implemented on the server side for security');
    
    // In a real implementation, you would call your backend API
    // which would handle the deletion using the Cloudinary Admin API
    throw new Error('Image deletion must be implemented on the server side');
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw error;
  }
}

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary image URL
 * @returns Public ID or null if not a valid Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const regex = /\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp|svg)$/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Validate Cloudinary configuration
 * @returns boolean indicating if configuration is valid
 */
export function validateCloudinaryConfig(): boolean {
  return !!(
    ENV.VITE_CLOUDINARY_CLOUD_NAME &&
    ENV.VITE_CLOUDINARY_UPLOAD_PRESET
  );
}
