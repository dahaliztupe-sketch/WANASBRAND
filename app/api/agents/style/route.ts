import { NextRequest, NextResponse } from 'next/server';
import {
  getStyleAdvice,
  generateOutfitPairing,
  getSeasonalLookbook,
  analyzeStyleQuizResult,
} from '@/lib/agents/style-agent';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      action: 'advice' | 'pairing' | 'lookbook' | 'quiz';
      data: Record<string, unknown>;
    };

    const { action, data } = body;

    let result;

    switch (action) {
      case 'advice':
        result = await getStyleAdvice(data as Parameters<typeof getStyleAdvice>[0]);
        break;
      case 'pairing':
        result = await generateOutfitPairing(
          data.productName as string,
          (data.language as 'ar' | 'en') ?? 'ar'
        );
        break;
      case 'lookbook':
        result = await getSeasonalLookbook(
          data.season as string,
          (data.language as 'ar' | 'en') ?? 'ar'
        );
        break;
      case 'quiz':
        result = await analyzeStyleQuizResult(
          data.answers as Record<string, string>,
          (data.language as 'ar' | 'en') ?? 'ar'
        );
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[API/Agents/Style]', error);
    return NextResponse.json({ error: 'Agent error' }, { status: 500 });
  }
}
