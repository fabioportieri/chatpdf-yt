"use client";
import { LoadChatType } from "@/app/api/load-chat/[chatId]/route";
import UnauthorizedPage from "@/app/unauthorized/page";
import ChatComponent from "@/components/ChatComponent";
import PDFViewer from "@/components/PDFViewer";
import useIframeCommunication from "@/hooks/useIframeCommunication";
import { useCookies } from "next-client-cookies";
import { useEffect, useState } from "react";
import Loading from "../loading";

type Props = {
  chatId: string;
};

const EmbeddedPageClient = ({ chatId }: Props) => {
  const cookies = useCookies();
  const [chatData, setChatData] = useState<LoadChatType | null>(null);

  const { error, success, loading } = useIframeCommunication(
    process.env.NEXT_PUBLIC_PARENT_SITE_URL!
  );

  useEffect(() => {
    async function fetchData() {
      console.log("triggering load-chat", chatId);
      const response = await fetch(`/api/load-chat/${chatId}`, {
        headers: { Cookie: cookies.toString() },
      });
      const data = await response.json();
      setChatData(data);

      console.log("🚀🚀🚀🚀 ~ fetchData ~ data:", data, success);
    }

    if (success && chatId) fetchData();
  }, [success, chatId, cookies]);

  if (error) {
    return <UnauthorizedPage />;
  }

  if (loading) {
    return <Loading />;
  }

  if (success && chatData) {
    return (
      <div className="flex max-h-screen h-screen">
        <div className="flex w-full max-h-screen h-screen">
          {/* pdf viewer */}
          <div className="max-h-screen p-4 oveflow-scroll flex-[5]">
            <PDFViewer
              pdf_url={chatData.fileKey || ""}
              file_key={chatData.fileKey}
            />
          </div>
          {/* chat component */}
          <div className="flex-[3] border-l-4 border-l-slate-200 overflow-y-scroll">
            <ChatComponent chatId={parseInt(chatId)} />
          </div>
        </div>
      </div>
    );
  }
};

export default EmbeddedPageClient;
