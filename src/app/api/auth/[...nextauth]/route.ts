import NextAuth, { AuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: { scope: "read:user public_repo" },
      },
    }),
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.login = (profile as { login?: string })?.login
      }
      return token
    },
    session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.login = token.login as string
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
