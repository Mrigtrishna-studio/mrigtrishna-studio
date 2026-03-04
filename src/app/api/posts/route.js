import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';

// GET: Fetch posts (can fetch all, or filter by a specific Series)
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const seriesId = searchParams.get('seriesId');

    // If a seriesId is provided in the URL, only get posts for that series
    const query = seriesId ? { seriesId } : {};
    
    // Sort by newest first
    const posts = await Post.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error("❌ GET POSTS ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Save a new Devlog with its custom sections
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    console.log(`📝 SAVING NEW POST: ${body.title} with ${body.sections?.length || 0} sections`);

    const newPost = await Post.create({
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      coverImage: body.coverImage,
      seriesId: body.seriesId,
      sections: body.sections || [], // Saves the array of blocks
      status: body.status || 'published',
    });

    return NextResponse.json({ success: true, data: newPost });
  } catch (error) {
    console.error("❌ POST CREATION ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT: Update an existing Devlog (Edit text, swap images, rearrange blocks)
export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ success: false, message: "Post ID is required" }, { status: 400 });
    }

    const updatedPost = await Post.findByIdAndUpdate(_id, updateData, { new: true });
    
    return NextResponse.json({ success: true, data: updatedPost });
  } catch (error) {
    console.error("❌ PUT UPDATE ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Remove a Devlog permanently
export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: "Post ID is required" }, { status: 400 });
    }

    await Post.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}