import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq, ilike } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export type IParams = { chatId: string };

export type LoadChatType = {
  chatId: string;
  fileKey: string;
};

export const dynamic = "auto";
export const fetchCache = "force-no-store"; // NECESSARIO ALTRIMENTI DB PRENDE DATI VECCHI

export const GET = async (
  req: NextRequest,
  { params }: { params: IParams }
) => {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user?.id;

  const { chatId } = params;

  console.log("🚀 ~ createChat session:", session);

  console.log("🚀 ~ file DEBUGGING embedded session:", session);

  const chat = await db
    .select()
    .from(chats)
    .where(eq(chats.id, parseInt(chatId)));
  if (!chat) {
    console.error("chat not found on chats table with id ", chatId);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }

  const fileKey = chat[0].fileKey;

  console.log("🚀 ~ chat query done:", chat);
  // should work with "eq", using "ilike" for this bug, prob. era solo problema di cache, togli TODO
  // https://stackoverflow.com/questions/71295272/where-on-normal-varchar-column-fails-for-some-values-but-works-with-trim-lower
  const _chats = await db
    .select()
    .from(chats)
    .where(ilike(chats.userId, "%" + userId + "%"));
  if (!_chats) {
    console.error("no chat found on with userId ", userId);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }

  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    console.error(
      "no chat id found: ",
      chatId,
      " in user chats:",
      _chats,
      "for userId:",
      userId
    );
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      chatId,
      fileKey,
    },
    { status: 200 }
  );
};
