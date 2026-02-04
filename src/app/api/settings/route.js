import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET() {
  await dbConnect();
  try {
    // Return the settings or an empty object if none exist
    const settings = await Settings.findOne();
    return NextResponse.json({ success: true, data: settings || {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    
    // Update the FIRST document found, or create one if it doesn't exist.
    // We pass 'body' directly so it saves ALL fields (hero, contact, socials, etc.)
    const settings = await Settings.findOneAndUpdate(
      {}, 
      body, 
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}