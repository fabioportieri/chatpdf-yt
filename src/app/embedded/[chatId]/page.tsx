import EmbeddedPageClient from "./_components/page-client";

type Props = {
  params: {
    chatId: string;
  };
};

const EmbeddedChatPage = async ({ params: { chatId } }: Props) => {
  return <EmbeddedPageClient chatId={chatId} />;
};

export default EmbeddedChatPage;
