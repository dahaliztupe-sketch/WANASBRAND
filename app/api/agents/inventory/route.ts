import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeInventoryHealth,
  predictSeasonalDemand,
  generateRestockAlert,
} from '@/lib/agents/inventory-agent';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      action: 'health' | 'forecast' | 'alert';
      data: Record<string, unknown>;
    };

    const { action, data } = body;
    let result;

    switch (action) {
      case 'health':
        result = await analyzeInventoryHealth(
          data.items as Parameters<typeof analyzeInventoryHealth>[0],
          (data.language as 'ar' | 'en') ?? 'ar'
        );
        break;
      case 'forecast':
        result = await predictSeasonalDemand(
          data.category as string,
          data.upcomingOccasion as string,
          data.historicalSales as Array<{ month: string; units: number }>,
          (data.language as 'ar' | 'en') ?? 'ar'
        );
        break;
      case 'alert': {
        const items = Array.isArray(data.items) ? data.items : [data];
        const alertText = await generateRestockAlert(
          items as Parameters<typeof generateRestockAlert>[0],
          (data.language as 'ar' | 'en') ?? 'ar'
        );
        result = { success: true, data: alertText, model: 'gemini-2.0-flash-lite' };
        break;
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[API/Agents/Inventory]', error);
    return NextResponse.json({ error: 'Agent error' }, { status: 500 });
  }
}
