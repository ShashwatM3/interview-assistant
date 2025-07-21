import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    // Make sure content is string
    const html = typeof response.data === 'string' ? response.data : '';

    res.status(200).json({ html });
  } catch (error: any) {
    console.error('Scraping failed:', error.message);

    // Always respond with valid JSON
    res.status(500).json({
      error: 'Failed to fetch the requested URL.',
      details: error.message || 'Unknown error',
    });
  }
}
