import { NextRequest, NextResponse } from 'next/server';
import {
  generateProductDescription,
  generateInstagramCaption,
  generateDPPNarrative,
  generateEmailSubjectLines,
  generateCollectionStory,
} from '@/lib/agents/content-agent';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      action: 'description' | 'instagram' | 'dpp' | 'emailSubjects' | 'collectionStory';
      data: Record<string, unknown>;
    };

    const { action, data } = body;

    let result;

    switch (action) {
      case 'description':
        result = await generateProductDescription(data as Parameters<typeof generateProductDescription>[0]);
        break;
      case 'instagram':
        result = await generateInstagramCaption(
          data.productName as string,
          data.mood as string,
          (data.language as 'ar' | 'en') ?? 'ar'
        );
        break;
      case 'dpp':
        result = await generateDPPNarrative(data as Parameters<typeof generateDPPNarrative>[0]);
        break;
      case 'emailSubjects':
        result = await generateEmailSubjectLines(
          data.campaignType as string,
          data.audienceSegment as string,
          (data.language as 'ar' | 'en') ?? 'ar',
          (data.count as number) ?? 5
        );
        break;
      case 'collectionStory':
        result = await generateCollectionStory(
          data.collectionName as string,
          data.inspiration as string,
          (data.language as 'ar' | 'en') ?? 'ar'
        );
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[API/Agents/Content]', error);
    return NextResponse.json({ error: 'Agent error' }, { status: 500 });
  }
}
