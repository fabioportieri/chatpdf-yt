import { NextResponse } from "next/server";
import { prepareChat } from "./prepare-chat";
import { getServerSession } from "next-auth/next";
import { auth } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";
// TODO NEXTAUTH

// /api/create-chat
export async function POST(req: Request, res: Response) {

  const session = await auth();
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  console.log("🚀 ~ createChat session:", session);


  try {
    const body = await req.json();
    const { file_key, file_name } = body;

    const chat_id = await prepareChat(userId, file_key, file_name);

    return NextResponse.json(
      {
        chat_id: chat_id[0].insertedId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
