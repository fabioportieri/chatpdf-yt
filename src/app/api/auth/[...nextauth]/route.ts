import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

const handler = NextAuth(authOptions);


export { handler as GET, handler as POST };
