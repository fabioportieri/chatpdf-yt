import { NextResponse } from "next/server";
import { NextAuthMiddlewareOptions, NextRequestWithAuth, withAuth } from "next-auth/middleware"

// OLD, with clerkjs
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
// export default authMiddleware({
//   publicRoutes: [
//     "/",
//     "/api/webhook",
//     "/api/load-pdf",
//     "/api/get-messages",
//     "/api/chat",
//     "/embedded/(.*)",
//   ],
// });


// https://next-auth.js.org/configuration/nextjs#middleware
// https://github.com/nextauthjs/next-auth/issues/8023


// taken from : https://nextjs.org/docs/pages/building-your-application/configuring/content-security-policy
// se non funziona: https://github.com/nextauthjs/next-auth/issues/8023
// export async function middleware(request: { headers: HeadersInit | undefined }) {
export async function middleware(request: NextRequestWithAuth) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self' blob: https://chatpdf-buck.s3.eu-north-1.amazonaws.com;
    frame-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://docs.google.com https://chatpdf-buck.s3.eu-north-1.amazonaws.com https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.1.266/pdf.worker.js http://localhost:3002;
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://docs.google.com https://chatpdf-buck.s3.eu-north-1.amazonaws.com https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.1.266/pdf.worker.js http://localhost:3002/*;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src https://chatpdf-buck.s3.eu-north-1.amazonaws.com;
    base-uri 'self';
    form-action 'self';
    frame-ancestors http://localhost:9000/ https://www.datamanagementitalia.it/ https://nutdemo.datamanagementitalia.it/;
    block-all-mixed-content;
    upgrade-insecure-requests;
`;

  const requestHeaders = new Headers(request.headers);

  // Setting request headers
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Content-Security-Policy",
    // Replace newline characters and spaces
    cspHeader.replace(/\s{2,}/g, " ").trim()
  );

  // Execute the NextAuth middleware which either returns a redirect response or nothing, if authentication
  // was not required. See source for more: https://github.com/nextauthjs/next-auth/blob/v4/packages/next-auth/src/next/middleware.ts#L99
  // If a redirect was returned, use it. Otherwise continue the response normally with NextResponse.next().
  // Omitting the config here, but you can still include it (i.e withAuth(request, { pages: ... }))
  const response = (await withAuth(request, options)) || NextResponse.next();
  // Set the CSP headers on the response
  requestHeaders.forEach((value, key) => {
    response.headers.append(key, value);
  });

  // return NextResponse.next({
  //   headers: requestHeaders,
  //   request: {
  //     headers: requestHeaders,
  //   },
  // });
  return response;
}

export const options: NextAuthMiddlewareOptions = {
  pages: {
    // signIn: '/login',
    error: '/error',
  },
  callbacks: {
    authorized({ req, token }) {
      // `/admin` requires admin role
      if (req.nextUrl.pathname === "/admin") {
        return token?.userRole === "admin"
      }
      // `/me` only requires the user to be logged in
      return !!token
    },
  },
}

// export const config = {
//   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };



// export default function middleware(request: NextRequestWithAuth) {
//   return NextResponse.next();
// }
