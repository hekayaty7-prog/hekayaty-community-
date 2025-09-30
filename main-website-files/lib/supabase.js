// =====================================================
// SUPABASE CONFIG - Add this to your main HEKAYATY website
// File: lib/supabase.js
// =====================================================

import { createClient } from '@supabase/supabase-js'

// Same configuration as StoryWeaveConnect
const supabaseUrl = 'https://agwspltdwnniogyhwimd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnd3NwbHRkd25uaW9neWh3aW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODI5NzEsImV4cCI6MjA3Mzg1ODk3MX0.PO5Lm0VEywhUhEbHBQlEoEfAwJtAoje-2WodjV6e3qY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection
console.log('✅ Supabase client initialized for community integration')
