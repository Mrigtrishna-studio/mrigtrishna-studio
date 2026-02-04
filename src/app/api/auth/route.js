import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import AdminCode from '@/models/AdminCode';

// 1. Configure the Email Sender (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { action, email, code } = body;

    // --- SCENARIO A: SEND OTP ---
    if (action === 'send') {
      // 🛑 Security: Only allow the studio owner to log in
      if (email !== process.env.EMAIL_USER) {
        return NextResponse.json(
          { success: false, message: "Unauthorized email." },
          { status: 403 }
        );
      }

      // 1. Generate 6-digit code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // 2. Save to DB (Expires strictly in 30 seconds)
      // Delete any old codes first to keep DB clean
      await AdminCode.deleteMany({ email });
      
      await AdminCode.create({
        email,
        code: otp,
        expiresAt: new Date(Date.now() + 30 * 1000) // 30 Seconds
      });

      // 3. Send Email
      await transporter.sendMail({
        from: `"Mrigtrishna Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Your Access Code: ${otp}`,
        text: `Your admin access code is: ${otp}\n\nThis code expires in 30 seconds.`,
      });

      return NextResponse.json({ success: true, message: "Code sent." });
    }

    // --- SCENARIO B: VERIFY OTP ---
    if (action === 'verify') {
      // 1. Find the code
      const validRecord = await AdminCode.findOne({ email, code });

      // 2. Validate existence and expiry
      if (!validRecord) {
        return NextResponse.json(
          { success: false, message: "Invalid code." },
          { status: 401 }
        );
      }

      if (new Date() > validRecord.expiresAt) {
        return NextResponse.json(
          { success: false, message: "Code expired." },
          { status: 401 }
        );
      }

      // 3. Success! Set the Secure Cookie
      // Note: "await cookies()" is required in Next.js 15+
      const cookieStore = await cookies();
      
      cookieStore.set('admin_token', 'mrigtrishna_secure_session', {
        httpOnly: true, // JavaScript cannot read this (prevents XSS attacks)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        maxAge: 60 * 60 * 24, // Session lasts 1 Day
        path: '/',
      });

      // 4. Cleanup (Delete the code so it can't be used again)
      await AdminCode.deleteMany({ email });

      return NextResponse.json({ success: true, message: "Login successful." });
    }

    // --- SCENARIO C: LOGOUT ---
    if (action === 'logout') {
      const cookieStore = await cookies();
      cookieStore.delete('admin_token');
      return NextResponse.json({ success: true, message: "Logged out." });
    }

    return NextResponse.json({ success: false, message: "Invalid action." }, { status: 400 });

  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500 }
    );
  }
}