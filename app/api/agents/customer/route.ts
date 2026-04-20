import { NextRequest, NextResponse } from 'next/server';
import {
  handleCustomerInquiry,
  detectComplaintUrgency,
} from '@/lib/agents/customer-agent';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      action: 'inquiry' | 'urgency';
      data: Record<string, unknown>;
    };

    const { action, data } = body;

    let result;

    switch (action) {
      case 'inquiry':
        result = await handleCustomerInquiry(data as Parameters<typeof handleCustomerInquiry>[0]);
        break;
      case 'urgency':
        result = await detectComplaintUrgency(data.message as string);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[API/Agents/Customer]', error);
    return NextResponse.json({ error: 'Agent error' }, { status: 500 });
  }
}
