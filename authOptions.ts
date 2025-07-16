// authOptions.ts
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./firebase";
import { getDoc, doc, setDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      // authOptions.ts
      async authorize(credentials) {
        console.log("🧪 authorize called with:", credentials);

        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        const userRef = doc(db, "users", email);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.log("❌ User not found in Firestore");
          return null;
        }

        const user = userSnap.data();

        console.log("✅ User found:", user);

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) return null;

        console.log("✅ Auth successful");
        return { id: email, name: user.name, email };
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.email = token.email as string;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
