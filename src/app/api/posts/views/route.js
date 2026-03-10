import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';

export async function POST(req) {
  try {
    await dbConnect();
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ success: false, message: "No slug provided" }, { status: 400 });
    }

    // $inc is a MongoDB operator that atomizes the increment 
    // This prevents "race conditions" if two people click at once
    const updatedPost = await Post.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!updatedPost) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, views: updatedPost.views });
  } catch (error) {
    console.error("View Count Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}