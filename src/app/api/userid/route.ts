import { NextRequest, NextResponse } from "next/server";

// https://github.com/vercel/next.js/issues/60723
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // const cookieStore = cookies();
  // const userId = cookieStore.get("userId");
  const userId = req.cookies.get("userId");

  if (!userId) {
    console.log("no cookie userId found, returning 401 unauthorized");
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  console.log("cookie userId found: ", userId);
  return NextResponse.json({ user: { id: userId.value } });
}
