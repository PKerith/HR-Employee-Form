import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using environment variables
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { email, password, profileData } = req.body;

  if (!email || !password || !profileData) {
    return res.status(400).json({ error: 'Missing email, password, or profile data' });
  }

  try {
    // Create new user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      options: { data: profileData },
    });

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ data });
  } catch (err: any) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
