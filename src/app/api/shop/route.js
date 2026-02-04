import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
  await dbConnect();
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    console.log("1. [SHOP] Connecting to DB...");
    await dbConnect();
    
    console.log("2. [SHOP] Reading Input...");
    const body = await req.json();
    console.log("3. [SHOP] Received Data:", body);

    // Validate Fields manually to catch missing data
    if (!body.title || !body.price || !body.image || !body.gumroadLink) {
      console.error("❌ [SHOP] Missing Fields!");
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    console.log("4. [SHOP] Creating Product...");
    const product = await Product.create(body);
    
    console.log("5. [SHOP] Success! Created:", product._id);
    return NextResponse.json({ success: true, data: product });

  } catch (error) {
    console.error("❌ [SHOP] SAVE FAILED:", error); // <--- WATCH YOUR TERMINAL FOR THIS
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}