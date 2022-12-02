import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret:process.env.NEXT_PUBLIC_SECRET,
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {}, 
      authorize(credentials, req) {
        const { email, password  } = credentials as {
          email: string;
          password: string;
        };
        // perform you login logic
        // find out user from db
        if (!email) {
          throw new Error("invalid credentials");
        }

        // if everything is fine
        return {
          email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    // error: '/auth/error',
    // signOut: '/auth/signout'
  },
  callbacks: {
    jwt(params) {
      // update token
      if (params.user?.role) {
        params.token.role = params.user.role;
      }
      // return final_token
      return params.token;
    },
  },
};

export default NextAuth(authOptions);