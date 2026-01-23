
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eirnihfpxvyqcobwosbc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpcm5paGZweHZ5cWNvYndvc2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMTIwNTAsImV4cCI6MjA4NDY4ODA1MH0._LVvcJRqAWQcGtvVmRJiS6aYWYF0AeTKHeRoGgPAi1w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
