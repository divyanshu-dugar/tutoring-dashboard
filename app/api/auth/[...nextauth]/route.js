import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyPassword } from "@/lib/password";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // async authorize(credentials) {
      //   if (!credentials?.email || !credentials?.password) {
      //     return null;
      //   }

      //   await connectDB();

      //   const user = await User.findOne({ email: credentials.email });
      //   if (!user) return null;

      //   const isValid = await verifyPassword(
      //     credentials.password,
      //     user.passwordHash
      //   );

      //   if (!isValid) return null;

      //   return {
      //     id: user._id.toString(),
      //     name: user.name,
      //     email: user.email,
      //     role: user.role,
      //   };
      // },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Missing credentials");
            return null;
          }

          await connectDB();

          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            console.log("❌ User not found");
            return null;
          }

          const isValid = await verifyPassword(
            credentials.password,
            user.passwordHash,
          );

          if (!isValid) {
            console.log("❌ Invalid password");
            return null;
          }

          console.log("✅ Login successful for:", user.email);

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
