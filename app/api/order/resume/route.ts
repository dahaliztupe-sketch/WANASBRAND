import { NextResponse } from 'next/server';

import { verifyCartToken } from '@/lib/integrations/whatsapp';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/cart?error=missing_token', req.url));
    }

    const cartData = await verifyCartToken(token);

    if (!cartData) {
      return NextResponse.redirect(new URL('/cart?error=invalid_token', req.url));
    }

    // Redirect to checkout with the verified cart data
    // In a real app, you might set a cookie or session with this data
    // For now, we redirect to a resume page that hydrates the store
    return NextResponse.redirect(new URL(`/checkout/resume?token=${token}`, req.url));
  } catch (error) {
    console.error('Reservation resume error:', error);
    return NextResponse.redirect(new URL('/cart?error=system_error', req.url));
  }
}
