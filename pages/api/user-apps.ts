import { NextApiRequest, NextApiResponse } from 'next';
import { setUserAppPermissions } from '@/models/userApp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { updates } = req.body;
  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: 'Invalid updates' });
  }
  try {
    for (const update of updates) {
      const { userId, appId, canView, canUse } = update;
      await setUserAppPermissions(userId, appId, { canView, canUse });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
