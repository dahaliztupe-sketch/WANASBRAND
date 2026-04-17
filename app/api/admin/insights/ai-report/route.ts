import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

import { db } from '@/lib/firebase/server';
import { verifyAdminSession, extractSessionToken } from '@/lib/utils/session';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const sessionToken = extractSessionToken(req.headers.get('cookie'));
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isAdmin } = await verifyAdminSession(sessionToken);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const { lowStockProducts, abandonedCartsCount } = await req.json();

    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const chatsSnap = await db.collection('concierge_chats').limit(10).get();
    const chatLogs = chatsSnap.docs.map(doc => {
      const data = doc.data();
      return (data.messages as { role: string; content: string }[])
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');
    }).join('\n---\n');

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a strategic fashion consultant for WANAS, a luxury fashion house.
Analyze the following data and provide a concise, sophisticated report for the management.

Data Context:
- Low Stock Products: ${JSON.stringify(lowStockProducts)}
- Abandoned Selections: ${abandonedCartsCount} active carts.
- Recent Customer Conversations:
${chatLogs}

Report Requirements:
1. Mood & Trend Forecasting: What are customers asking for?
2. Operational Recommendations: Which products need restocking or promotion?
3. Strategic Insight: One high-level advice to improve conversion.

Keep the tone professional, elegant, and insightful.`,
    });

    return NextResponse.json({ report: response.text || '' });
  } catch (error) {
    console.error('AI Report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
