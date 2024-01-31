import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // for public routes, we don't need to check for a token
  console.log(`Received ${req.method} request to ${req.url} at ${new Date()}`);
  // check jwt cookie:
  // https://github.com/rajeshberwal/nextjs-jwt-auth-middleware/blob/main/middleware.ts
  return NextResponse.next();
}
