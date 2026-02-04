import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { name, email, category, message } = await req.json();

    // 1. Configure the Transporter (Using Gmail as an example)
    // NOTE: You need to generate an "App Password" if using Gmail.
    // Go to Google Account -> Security -> 2-Step Verification -> App Passwords
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Put your email in .env
        pass: process.env.EMAIL_PASS, // Put your App Password in .env
      },
    });

    // 2. Email Content
    const mailOptions = {
      from: `"${name}" <${email}>`, // Sender Name
      to: process.env.EMAIL_USER,    // Your Email (Receiver)
      subject: `[${category.toUpperCase()}] New Message from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Category: ${category}
        
        Message:
        ${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #D4AF37;">New Inquiry: ${category}</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr />
          <p style="font-size: 16px;">${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    };

    // 3. Send Email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email.' }, { status: 500 });
  }
}