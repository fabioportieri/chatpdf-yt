import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// export const runtime = "edge"; si rompe con il middleware next-auth, rimettilo se si toglie next-auth

export const POST = async (req: Request) => {

  const session = await auth();
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  console.log("🚀 ~ get-messages session:", session);



  const { chatId } = await req.json();
  const _messages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId));
  return NextResponse.json(_messages);
};
