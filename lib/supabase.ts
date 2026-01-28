
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxvpmtjegttvhnjxjxtx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dnBtdGplZ3R0dmhuanhqeHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NjI0MjEsImV4cCI6MjA4NTAzODQyMX0.2wEtGdahvt7l4BLpAesGh_5CI7ZYtSmV0Vjw2CRC9_s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
