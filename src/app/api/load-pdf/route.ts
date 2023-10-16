import { accessTokenPlain, decryptData } from "@/lib/crypto";
import { uploadToS3Server } from "@/lib/s3-upload-server";
import axios from "axios";
import { UUID } from "crypto";
import { NextResponse } from "next/server";
import { prepareChat } from "../create-chat/prepare-chat";

export type LoadPdfPayload = {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  requestId: UUID;
  userId: UUID;
  callback: string;
  accessToken: string;
};

export async function POST(req: Request, res: Response) {
  console.log("/load-pdf!");
  const { file, filename, mimetype, userId, requestId, callback, accessToken } =
    await req.json();
  console.log(
    "🚀 ~ file: route.ts:15 ~ POST ~  requestId, userId, callback, accessToken:",
    requestId,
    userId,
    callback,
    accessToken
  );

  const accessTokenDecrypted = decryptData(accessToken);

  if (accessTokenDecrypted !== accessTokenPlain) {
    return NextResponse.json(
      { error: "Wrong Access Token provided" },
      { status: 401 }
    );
  }

  console.log("🚀 ~ file: route.ts:36 ~ POST ~ accessTokenDecrypted valid!");

  // Validate the callback
  if (!isValidCallback(callback)) {
    return NextResponse.json(
      { error: "Invalid callback URL" },
      { status: 400 }
    );
  }
  console.log("🚀 ~ file: route.ts:36 ~ POST ~ callback valid!");

  // Validate the requestId (UUID)
  if (!isValidUUID(requestId)) {
    return NextResponse.json({ error: "Invalid requestId" }, { status: 400 });
  }

  // Validate the userId (UUID)
  if (!isValidUUID(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  console.log("🚀 ~ file: route.ts:36 ~ POST ~ uuid valid!");

  // Validate the file
  const pdfFile = validatePDFFile(file, userId, mimetype);
  if (!pdfFile) {
    return NextResponse.json({ error: "Invalid PDF file" }, { status: 400 });
  }
  console.log("🚀 ~ file: route.ts:36 ~ POST ~ pdf valid valid!");
  runJob(pdfFile, userId, requestId, accessToken, callback);

  console.log("🚀 ~ file: EXITING!!");
  return NextResponse.json({ success: true }, { status: 200 });
}

// async function runJobTest(
//   file: NodeFile,
//   id: UUID,
//   accessToken: string,
//   callback: string
// ): Promise<void> {
//   console.log("Starting job...");
//   // Simulate a 5-second delay
//   await new Promise((resolve) => setTimeout(resolve, 5000));
//   console.log("Job completed.");
// }

async function runJob(
  file: NodeFile,
  userId: UUID,
  requestId: UUID,
  accessToken: string,
  callback: string
): Promise<void> {
  let fileUploadedData: {
    file_key: string;
    file_name: string;
  };

  try {
    fileUploadedData = await uploadToS3Server(file);
  } catch (error) {
    console.error("error on load-pdf::uploadToS3", error);
    //   send NEGATIVE response to webhook since job completed with errors
    await sendWebhookResponseFailed(callback, requestId, accessToken);
    return;
  }
  let chat_id;
  try {
    chat_id = await prepareChat(
      userId,
      fileUploadedData.file_key,
      fileUploadedData.file_name
    );
    if (!chat_id || !chat_id.length) throw new Error("chat id undefined!");
  } catch (error) {
    console.error("error on prepare chat and embedding documents", error);
    //   send NEGATIVE response to webhook since job completed with errors
    await sendWebhookResponseFailed(callback, requestId, accessToken);
    return;
  }

  //   send response to webhook since job completed fine
  await sendWebhookResponseSuccess(
    callback,
    requestId,
    chat_id[0].insertedId,
    accessToken
  );
  console.log(
    "🚀 ~ webhook succesfully called and file imported at endpoint:",
    callback
  );
  return;
}

async function sendWebhookResponseSuccess(
  endpoint: string,
  requestId: UUID,
  chatId: string,
  accessToken: string
): Promise<void> {
  try {
    await axios.post(endpoint, {
      requestId,
      chatId,
      accessToken,
      result: true,
    });
  } catch (error) {
    console.error(
      "error on sendWebhookResponseSuccess, could not call webhook, endpoint:",
      endpoint,
      error
    );
  }
}
async function sendWebhookResponseFailed(
  endpoint: string,
  requestId: UUID,
  accessToken: string
): Promise<void> {
  try {
    await axios.post(endpoint, {
      requestId,
      accessToken,
      result: false,
    });
  } catch (error) {
    console.error(
      "error on sendWebhookResponseFailed, could not call webhook, endpoint:",
      endpoint,
      error
    );
  }
}

// Validation functions
function isValidCallback(callback: string): boolean {
  // Implement your callback validation logic here
  // Return true if the callback is valid, otherwise return false
  // You might want to check if it's a valid URL, for example
  // Example validation: return callback.startsWith("https://example.com/");
  return true; // Modify this based on your actual validation logic
}

function isValidUUID(id: UUID): boolean {
  // Implement your UUID validation logic here
  // Return true if the UUID is valid, otherwise return false
  // Example validation: return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
  return true; // Modify this based on your actual validation logic
}

// TODO errore qui:
function validatePDFFile(
  buff: string,
  userId: string,
  mimetype: string
): NodeFile | null {
  console.log("It is a string: ", buff.substring(0, 45));
  // if (typeof buff === 'string') {
  //   // It's a string SI e' STRINGA
  //   console.log('It is a string');
  // } else if (Buffer.isBuffer(buff)) {
  //   // It's a Buffer
  //   console.log('It is a Buffer');
  // } else if (buff instanceof File) {
  //   // It might be a File (you should define the File class)
  //   console.log('It is a File');
  // } else {
  //   // None of the above
  //   console.log('It is of an unknown type');
  // }

  // Check if the file is not null
  if (!buff) {
    return null;
  }

  const filename = "nut-" + userId + "-nut"; // filename set to userId with nut prefix and suffix to adhere to chromadb standard

  const buf = Buffer.from(buff, "base64");
  console.log("🚀 ~ file: route.ts:180 ~ buf created");
  // TODO convert Buffer to File
  const blob = new Blob([buf]);
  console.log("🚀 ~ file: route.ts:180 ~ BLOB created");

  // Create a File from the Blob error ReferenceError: File is not defined !! non posso usare File ma fs module

  // const file = new File([blob], filename, { type: mimetype });
  const file = new NodeFile(blob, filename, { type: mimetype });

  console.log("🚀 ~ file: route.ts:180 ~ FILE created");
  // Check if the file type is PDF
  if (file.type !== "application/pdf") {
    return null;
  }

  //   // Check if the file size is within the allowed range (0 - 100MB)
  if (file.size <= 0 || file.size > 100 * 1024 * 1024) {
    return null;
  }

  return file;
}

// this class simulate WebApi File class since nodejs does not have it.
export class NodeFile {
  blob: Blob;
  name: string;
  size: number;
  type: string;
  lastModified: number;

  constructor(
    blob: Blob,
    name: string,
    options: { type?: string; lastModified?: number } = {}
  ) {
    // super([blob], name, options);
    this.blob = blob;
    this.name = name;
    this.size = blob.size;
    this.type = options.type || "";
    this.lastModified = options.lastModified || Date.now();
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return this.blob.arrayBuffer();
  }
}
