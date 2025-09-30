// =====================================================
// ENVIRONMENT VARIABLES LOADER
// =====================================================
// Simple fallback for environment variables

export const ENV = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://agwspltdwnniogyhwimd.supabase.co',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnd3NwbHRkd25uaW9neWh3aW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODI5NzEsImV4cCI6MjA3Mzg1ODk3MX0.PO5Lm0VEywhUhEbHBQlEoEfAwJtAoje-2WodjV6e3qY',
  VITE_CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'due3pv1rm',
  VITE_CLOUDINARY_API_KEY: import.meta.env.VITE_CLOUDINARY_API_KEY || '373296268929843',
  VITE_CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'community',
  VITE_CLOUDINARY_FOLDER: import.meta.env.VITE_CLOUDINARY_FOLDER || 'storyweave',
}

// Debug log
console.log('Environment variables loaded:', {
  supabaseUrl: ENV.VITE_SUPABASE_URL ? 'Found' : 'Missing',
  supabaseKey: ENV.VITE_SUPABASE_ANON_KEY ? 'Found' : 'Missing',
  cloudinaryCloud: ENV.VITE_CLOUDINARY_CLOUD_NAME ? 'Found' : 'Missing',
})
