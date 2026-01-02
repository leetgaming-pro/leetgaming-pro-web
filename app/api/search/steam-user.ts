import { NextApiRequest, NextApiResponse } from "next";

const REPLAY_API_URL =
  process.env.REPLAY_API_URL ||
  process.env.NEXT_PUBLIC_REPLAY_API_URL ||
  "http://localhost:8080";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { steamId } = req.body;

    if (!steamId) {
      return res.status(400).json({ error: "Steam ID is required" });
    }

    try {
      const userData = await fetchSteamUserData(steamId);
      return res.status(200).json(userData);
    } catch (error) {
      console.error("Failed to fetch Steam user data:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        error: "Failed to fetch user data",
        details: errorMessage,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function fetchSteamUserData(steamId: string) {
  // Call replay-api Steam user endpoint
  const response = await fetch(`${REPLAY_API_URL}/steam/users/${steamId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Steam API returned ${response.status}: ${response.statusText}`
    );
  }

  return await response.json();
}
