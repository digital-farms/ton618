import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kozbsjeqafhthbwekhjl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvemJzamVxYWZodGhid2VraGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNjUyNTIsImV4cCI6MjA1NTc0MTI1Mn0.jjwhtP3qcpI7bsEUXatGQ3OzTXwD6tqCHw9a6MC5d5k'

export const supabase = createClient(supabaseUrl, supabaseKey)
