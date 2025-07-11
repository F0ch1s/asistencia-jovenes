// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hidepmxirlzxudyyapwg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZGVwbXhpcmx6eHVkeXlhcHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNjIyODksImV4cCI6MjA2NzgzODI4OX0.GJglTHsrG-7etnoASyw6MmJjxt9royetkko6rvhImdM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
