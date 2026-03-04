import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Series from '@/models/Series';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    // Await params in Next.js 15+ (if you are using the latest version)
    const { slug } = await params;

    // Find the specific series matching the slug
    const series = await Series.findOne({ slug });

    if (!series) {
      return NextResponse.json({ success: false, message: "Series not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: series });
  } catch (error) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}