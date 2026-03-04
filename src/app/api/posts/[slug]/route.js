import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;

    const post = await Post.findOne({ slug });

    if (!post) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("❌ FETCH POST ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}