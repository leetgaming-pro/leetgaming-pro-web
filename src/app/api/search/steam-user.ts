import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { steamId } = req.body;

        if (!steamId) {
            return res.status(400).json({ error: 'Steam ID is required' });
        }

        try {
            // Replace with actual API call to Steam to get user data
            const userData = await fetchSteamUserData(steamId);

            return res.status(200).json(userData);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch user data' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

async function fetchSteamUserData(steamId: string) {
    // Mock function to simulate fetching user data from Steam API
    // Replace with actual implementation
    return {
        steamId,
        username: 'SampleUser',
        games: ['Game1', 'Game2', 'Game3']
    };
}