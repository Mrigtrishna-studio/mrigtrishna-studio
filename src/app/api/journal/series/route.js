import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Series from '@/models/Series';

// GET: Fetch all project series cards for the dashboard
export async function GET() {
  try {
    await dbConnect();
    const series = await Series.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: series });
  } catch (error) {
    console.error("❌ GET ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch series" }, { status: 500 });
  }
}

// POST: Create a new project series card
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // 💡 This log will show up in your VS Code terminal
    console.log("📥 API RECEIVED DATA:", body);

    const newSeries = await Series.create({
      title: body.title,
      slug: body.slug,
      description: body.description,
      
      // 🚨 THE FIX: Explicitly saving the coverImage URL to the database
      coverImage: body.coverImage, 
      
      status: body.status || 'published',
    });

    console.log("✅ SUCCESSFULLY SAVED TO MONGO:", newSeries);

    return NextResponse.json({ success: false, message: "SHIORI IS TESTING" });
  } catch (error) {
    console.error("❌ POST ERROR:", error);
    
    // Handle duplicate slugs
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: "A series with this title/slug already exists." 
      }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Remove a series card
export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: "Series ID is missing" }, { status: 400 });
    }

    await Series.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, message: "Series deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to delete series" }, { status: 500 });
  }
}