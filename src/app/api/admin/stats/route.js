import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';

export async function GET() {
  try {
    await dbConnect();

    // 1. Fetch all posts but only get the 'views' and 'title' fields to keep it fast
    const allPosts = await Post.find({}, 'title views').sort({ views: -1 });

    // 2. Sum up all the views for your "Total Visitors" metric
    const totalViews = allPosts.reduce((acc, post) => acc + (post.views || 0), 0);

    // 3. Get your top 3 most-read posts
    const topPosts = allPosts.slice(0, 3).map(post => ({
      title: post.title,
      views: post.views || 0
    }));

    return NextResponse.json({
      success: true,
      totalViews,
      topPosts
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}