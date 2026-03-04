import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// This initializes NextAuth with the rules we wrote in auth.js
const handler = NextAuth(authOptions);

// Next.js App Router requires exporting the handler for both GET and POST requests
export { handler as GET, handler as POST };