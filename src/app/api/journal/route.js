import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Series from '@/models/Series'; // 🚨 IMPORTING SERIES MODEL INSTEAD

// GET: Fetch all Series to display as Journal entries
export async function GET() {
  try {
    await dbConnect();
    
    // 🔍 Fetching from the 'Series' collection where your data actually is
    const items = await Series.find({}).sort({ createdAt: -1 });
    
    console.log(`✅ SUCCESS: Found ${items.length} items in Series for the Journal Page`);
    
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

// POST: If you create a post here, it also goes into Series
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const newItem = await Series.create({
      title: body.title,
      slug: body.slug,
      description: body.description,
      coverImage: body.coverImage, // Using the fixed Cloudflare field
      status: body.status || 'published',
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Handles deletion from the Series collection
export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    await Series.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}