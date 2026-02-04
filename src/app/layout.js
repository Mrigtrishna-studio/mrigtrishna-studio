import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mrigtrishna Studio",
  description: "The Portfolio of Niraj Kumar",
};

export default function RootLayout({ children }) {
  return (
    // FIX: Add suppressHydrationWarning here
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-navy text-white`}
      >
        {children}
      </body>
    </html>
  );
}