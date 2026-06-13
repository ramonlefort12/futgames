import { NextResponse } from 'next/server';
import { recordTournamentWin } from '@/app/lib/data';
import { TournamentUpdatePayload } from '@/lib/definitions';

export async function POST(request: Request) {
  try {
    const body: TournamentUpdatePayload = await request.json();
    
    if (!body.countryName) {
      return NextResponse.json({ error: 'Missing countryName' }, { status: 400 });
    }

    await recordTournamentWin(body.countryName);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}