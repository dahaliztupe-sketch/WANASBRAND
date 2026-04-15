import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { getStorage } from 'firebase-admin/storage';

import { db } from '@/lib/firebase/server';
import { adminRateLimit } from '@/lib/upstash';

export async function POST(request: Request) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    if (adminRateLimit) {
      const { success } = await adminRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Optimize image with sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Use db.app to access the initialized admin app
    const bucket = getStorage(db.app).bucket();
    
    const filename = `products/${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}.webp`;
    const fileRef = bucket.file(filename);

    await fileRef.save(optimizedBuffer, {
      metadata: {
        contentType: 'image/webp',
      },
    });

    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Error uploading and optimizing image:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
