import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file found' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;

    // Upload RAW file (No resizing/sharp)
    await R2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueName,
      Body: buffer,
      ContentType: file.type,
    }));

    const url = `${process.env.R2_PUBLIC_URL}/${uniqueName}`;

    return NextResponse.json({ success: true, url });

  } catch (error) {
    // ⚠️ LOOK HERE IN YOUR VS CODE TERMINAL FOR THE REAL ERROR
    console.error("❌ UPLOAD ERROR DETAILED:", error); 
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}