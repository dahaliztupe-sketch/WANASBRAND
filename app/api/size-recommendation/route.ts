import { NextRequest, NextResponse } from 'next/server';
import { getAISizeRecommendation, type BodyMeasurements, type ProductCategory } from '@/lib/services/size-recommendation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      measurements: BodyMeasurements;
      category: ProductCategory;
      productName: string;
      language?: 'ar' | 'en';
    };

    const { measurements, category, productName, language = 'ar' } = body;

    if (!measurements || !category || !productName) {
      return NextResponse.json({ error: 'measurements, category, productName are required' }, { status: 400 });
    }

    const recommendation = await getAISizeRecommendation(measurements, category, productName, language);
    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('[SizeAPI] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
