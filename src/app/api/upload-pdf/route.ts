import { downloadFromMinioAndConvertToBlob } from "@/lib/minio-server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { auth } from "@/lib/auth";
import { uploadToMinioServer } from "@/lib/minio-upload-server";

// https://github.com/vercel/next.js/discussions/50078

// /api/download-pdf
export async function POST(req: Request, res: Response) {

  const session = await auth();
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // console.log("🚀 ~ upload-pdf session:", session);

  try {
    const formData = await req.formData();

    const file = formData.get('file') as File;


    const buffer: Buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;

    const data: { file_key: string; file_name: string } = await uploadToMinioServer({ buffer, filename });
    console.log("🚀 ~ data:", data);
    return NextResponse.json({ data }, { status: 200 });


  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
