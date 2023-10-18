
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { NextAuthOptions, getServerSession } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";



export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        KeycloakProvider({
            id: "keycloak",
            clientId: process.env.KEYCLOAK_ID!,
            clientSecret: process.env.KEYCLOAK_SECRET!,
            issuer: process.env.KEYCLOAK_ISSUER,
        }),
        //   GoogleProvider({
        //     clientId: process.env.GOOGLE_CLIENT_ID!,
        //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        //   }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, token, user }: { session: any, token: any, user: any }) {
            // Send properties to the client
            session.user.id = token.sub; // id of user logged in
            // console.log("🚀 NEXTAUTH token session users:", token, session, user);
            return session
        }
    },
    pages: {
        // signIn: '/login',
        error: '/error',
    },
} satisfies NextAuthOptions;

export function auth(...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []) {
    return getServerSession(...args, authOptions)
}
