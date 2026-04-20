import { NextRequest, NextResponse } from 'next/server';
import { generateBusinessReport, analyzeTrend, forecastDemand } from '@/lib/agents/analytics-agent';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      action: 'report' | 'trend' | 'forecast';
      data: Record<string, unknown>;
    };

    const { action, data } = body;
    let result;

    switch (action) {
      case 'report':
        result = await generateBusinessReport(data, (data.language as 'ar' | 'en') ?? 'ar');
        break;
      case 'trend':
        result = await analyzeTrend(
          data.trendData as Array<{ date: string; revenue: number }>,
          (data.language as 'ar' | 'en') ?? 'ar'
        );
        break;
      case 'forecast':
        result = await forecastDemand(
          data.historicalData as never[],
          data.upcomingEvent as string,
          (data.language as 'ar' | 'en') ?? 'ar'
        );
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[API/Agents/Analytics]', error);
    return NextResponse.json({ error: 'Agent error' }, { status: 500 });
  }
}
