import ChatComponent from "@/components/ChatComponent";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

type Props = {
  params: {
    chatId: string;
  };
};

const EmbeddedChatPage = async ({ params: { chatId } }: Props) => {
  const chat = await db
    .select()
    .from(chats)
    .where(eq(chats.id, parseInt(chatId)));
  if (!chat) {
    return redirect("/error");
  }
  const userId = chat[0].userId;

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/error");
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/error");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));

  return (
    <div className="flex max-h-screen h-screen ">
      <div className="flex w-full max-h-screen h-screen ">
        {/* pdf viewer */}
        <div className="max-h-screen p-4 oveflow-scroll flex-[5]">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
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
