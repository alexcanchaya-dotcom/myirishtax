import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;

        // Fetch user subscription data
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            subscriptionTier: true,
            subscriptionStatus: true,
            stripeCustomerId: true,
          },
        });

        if (dbUser) {
          token.subscriptionTier = dbUser.subscriptionTier;
          token.subscriptionStatus = dbUser.subscriptionStatus;
          token.stripeCustomerId = dbUser.stripeCustomerId;
        }
      }

      // Handle session update trigger
      if (trigger === "update" && session) {
        token.subscriptionTier = session.subscriptionTier;
        token.subscriptionStatus = session.subscriptionStatus;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.subscriptionTier = token.subscriptionTier as string;
        session.user.subscriptionStatus = token.subscriptionStatus as string;
        session.user.stripeCustomerId = token.stripeCustomerId as string | null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
