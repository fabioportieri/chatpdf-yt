import { loadMinioIntoChromaDB } from "@/lib/chroma";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
// logic shared between /create-chat api and /load-pdf
export async function prepareChat(
  userId: string,
  file_key: string,
  file_name: string
): Promise<any> {
  console.log("filekey: ", file_key, "filename: ", file_name);

  await loadMinioIntoChromaDB(file_key);

  const chat_id = await db
    .insert(chats)
    .values({
      fileKey: file_key,
      pdfName: file_name,
      pdfUrl: "TODO://" + file_key,
      userId,
    })
    .returning({
      insertedId: chats.id,
    });
  return chat_id;
}
