// import type { NextApiRequest, NextResponse } from "next";
import { comparePassword } from "@/utils/cryptoUtils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { hashedSecret, userId } = await req.json();

    const passwordMatch = await comparePassword(
      process.env.NUTPROJECT_PASSWORD!,
      hashedSecret
    );

    if (passwordMatch) {
      // set cookie with userId
      const cookieStore = cookies();

      cookieStore.set("userId", userId, { httpOnly: false });
      console.log("cookie stored: ", cookieStore.get("userId"));
      const response = NextResponse.json(
        { message: "Authentication successful" },
        { status: 200 }
      );

      response.cookies.set("userId", userId, { httpOnly: false });
      return response;
    } else {
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
