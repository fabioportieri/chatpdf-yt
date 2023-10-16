import { downloadFromS3AndConvertToBase64 } from "@/lib/s3-server";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// https://github.com/vercel/next.js/discussions/50078

// /api/download-pdf
export async function POST(req: Request, res: Response) {

  try {
    const body = await req.json();
    const { file_key } = body;


    const blob = await downloadFromS3AndConvertToBase64(file_key);

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
