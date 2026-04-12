import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { getStorage } from 'firebase-admin/storage';
import { initAdmin } from '@/lib/firebase/server';

export async function POST(request: Request) {
  try {
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

    // Initialize Firebase Admin
    initAdmin();
    const bucket = getStorage().bucket();
    
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
