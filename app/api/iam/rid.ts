import { NextRequest, NextResponse } from 'next/server';

interface OnboardRequestBody {
  v_hash: string;
  steam_id: string;
}

export const POST = async (req: NextRequest) => {
  const body = await req.json() as OnboardRequestBody;

  const ctoken = await fetch(process.env.REPLAY_API_URL + '/onboard/steam', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      v_hash: body.v_hash,
      steam: {
        id: body.steam_id,
      },
    }),
  });

  if (!ctoken.ok) {
    const errorData = await ctoken.json();
    return NextResponse.json(errorData, { status: ctoken.status });
  }

  const data = await ctoken.json();
  const { user_id: uid, resource_owner: rid } = data;

  return NextResponse.json({ uid, rid });
}