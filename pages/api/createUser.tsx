import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Use service role key (server-side only)
const supabaseAdmin = createClient(
  'https://yxvpmtjegttvhnjxjxtx.supabase.co', // Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dnBtdGplZ3R0dmhuanhqeHR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ2MjQyMSwiZXhwIjoyMDg1MDM4NDIxfQ.e0FMFNyvFYubONJUxMOYZ5SVKNOMLdYtpmeEDz01O7U'                    // Service role key
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password, profileData } = req.body;

    try {
      // Create user in Supabase Auth
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        options: { data: profileData }
      });

      if (error) return res.status(400).json({ error: error.message });

      return res.status(200).json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
