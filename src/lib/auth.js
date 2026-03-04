import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "text" },
        code: { label: "Code", type: "text" }, // Accept both to prevent mismatch
      },
      async authorize(credentials) {
        await dbConnect();

        console.log("👉 1. LOGIN ATTEMPT FOR:", credentials.email);

        const user = await User.findOne({
          email: credentials.email.toLowerCase()
        });

        if (!user) {
          console.log("❌ ERROR: User not found in database.");
          throw new Error("User not found");
        }

        console.log("👉 2. USER FOUND. DB Access Code is:", user.accessCode);

        // Catch the code whether the frontend sent it as 'password' or 'code'
        const enteredCode = credentials.code || credentials.password;
        console.log("👉 3. CODE ENTERED ON SCREEN IS:", enteredCode);

        // Convert both to strings to prevent Number vs String strict equality failures
        const isValid = String(user.accessCode) === String(enteredCode);

        if (isValid) {
          console.log("✅ SUCCESS: Codes match! Creating session...");

          // Clear the code so it cannot be used again
          user.accessCode = null;
          await user.save();

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email
          };
        }

        console.log("❌ ERROR: Codes do NOT match.");
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // SAFE CHECK: Ensure session.user exists before attaching the ID
      if (token && session.user) {
        session.user.id = token.id;
      } else if (token) {
        session.user = { id: token.id }; // Create it if it doesn't exist
      }
      return session;
    },
  },
};