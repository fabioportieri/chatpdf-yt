import { auth } from "@/lib/auth";
import { downloadFromMinioAndConvertToBlob } from "@/lib/minio-server";
import { NextResponse } from "next/server";

// https://github.com/vercel/next.js/discussions/50078

// /api/download-pdf
export async function POST(req: Request, res: Response) {
  const session = await auth();
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  console.log("🚀 ~ download-pdf session:", session);

  try {
    const body = await req.json();
    const { file_key } = body;

    const blob = await downloadFromMinioAndConvertToBlob(file_key);

    const headers = new Headers();

    headers.set("Content-Type", "application/pdf");

    return new NextResponse(blob, { status: 200, statusText: "OK", headers });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
