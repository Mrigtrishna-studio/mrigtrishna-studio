import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Portfolio from '@/models/Portfolio';

export async function GET(req) {
  try {
    await dbConnect();
    // Fetch all items, newest first
    const items = await Portfolio.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const newItem = await Portfolio.create({
      title: body.title,
      image: body.image, // URL from Cloudflare
      artstationLink: body.artstationLink,
      category: body.category || 'General',
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    await Portfolio.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}