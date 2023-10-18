import ChatComponent from "@/components/ChatComponent";
import PDFViewer from "@/components/PDFViewer";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq, ilike } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

type Props = {
  params: {
    chatId: string;
  };
};

export const dynamic = "auto";
export const fetchCache = "force-no-store"; // NECESSARIO ALTRIMENTI DB PRENDE DATI VECCHI

const EmbeddedChatPage = async ({ params: { chatId } }: Props) => {
  const session = await auth();
  if (!session || !session.user.id) {
    return redirect("/error");
  }
  const userIdFromSession = session.user.id;
  console.log("🚀 ~ createChat session:", session);

  console.log("🚀 ~ file DEBUGGING embedded session:", session);

  const chat = await db
    .select()
    .from(chats)
    .where(eq(chats.id, parseInt(chatId)));
  if (!chat) {
    console.error("chat not found on chats table with id ", chatId);
    return redirect("/error");
  }
  // chat[0] === currentChat, refactoring
  const userId = chat[0].userId;
  const file_key = chat[0].fileKey;

  // should work with "eq", using "ilike" for this bug, prob. era solo problema di cache, togli TODO
  // https://stackoverflow.com/questions/71295272/where-on-normal-varchar-column-fails-for-some-values-but-works-with-trim-lower
  const _chats = await db
    .select()
    .from(chats)
    .where(ilike(chats.userId, "%" + userId.trim() + "%"));
  if (!_chats) {
    console.error("no chat found on with userId ", userId);
    return redirect("/error");
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    // console.error(
    //   "no chat id found: ",
    //   chatId,
    //   " in user chats:",
    //   _chats,
    //   "for userId:",
    //   userId
    // );
    return redirect("/error");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));

  return (
    <div className="flex max-h-screen h-screen ">
      <div className="flex w-full max-h-screen h-screen ">
        {/* pdf viewer */}
        <div className="max-h-screen p-4 oveflow-scroll flex-[5]">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ""} file_key={file_key} />
        </div>
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200 overflow-y-scroll">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default EmbeddedChatPage;
