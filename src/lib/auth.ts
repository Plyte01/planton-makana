// src/lib/auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";
import { Adapter } from "next-auth/adapters"; // <-- STEP 1: IMPORT ADAPTER
import { DefaultJWT } from "next-auth/jwt";
import GitHubProvider from "next-auth/providers/github";
// import EmailProvider from "next-auth/providers/email";
import { db } from "./db";
import { Role } from "@prisma/client";

// --- MODULE AUGMENTATION FOR NEXT-AUTH ---
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: Role;
    id: string;
  }
}
// -----------------------------------------

export const authOptions: NextAuthOptions = {
  // --- STEP 2 & 3: CAST THE ADAPTER ---
  adapter: PrismaAdapter(db) as Adapter,
  // ------------------------------------
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // EmailProvider({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST,
    //     port: Number(process.env.EMAIL_SERVER_PORT),
    //     secure: true,
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER,
    //       pass: process.env.EMAIL_SERVER_PASSWORD,
    //     },
    //   },
    //   from: process.env.EMAIL_FROM,
    // }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (!token.email) {
        return token;
      }

      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user.id;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        role: dbUser.role,
      };
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
