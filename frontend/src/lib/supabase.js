import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hyplrlakowbwntkidtcp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cGxybGFrb3did250a2lkdGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzY5MzIsImV4cCI6MjA3Nzg1MjkzMn0.HBvp7AxL3Bd_39HtvPWdp9Ri7DkPbKZQ1kDMrGJvDxc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

