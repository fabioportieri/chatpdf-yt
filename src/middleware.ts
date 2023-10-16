import { NextResponse } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
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

export function middleware(request: { headers: HeadersInit | undefined }) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self' https://chatpdf-buck.s3.eu-north-1.amazonaws.com;
    frame-src 'self' 'unsafe-inline' 'unsafe-eval' https://docs.google.com https://chatpdf-buck.s3.eu-north-1.amazonaws.com https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.1.266/pdf.worker.js http://localhost:3002;
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

  return NextResponse.next({
    headers: requestHeaders,
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
