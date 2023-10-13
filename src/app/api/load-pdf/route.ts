import { accessTokenPlain, decryptData } from "@/lib/crypto";
import { uploadToS3 } from "@/lib/s3";
import axios from "axios";
import { UUID } from "crypto";
import { NextResponse } from "next/server";

export type LoadPdfPayload = {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  id: UUID;
  callback: string;
  accessToken: string;
};

export async function POST(req: Request, res: Response) {
  console.log("/load-pdf!");
  const { buffer, filename, mimetype, id, callback, accessToken } =
    await req.json();
  console.log(
    "🚀 ~ file: route.ts:15 ~ POST ~ buffer, id, callback, accessToken:",
    buffer,
    id,
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

  // Validate the callback
  if (!isValidCallback(callback)) {
    return NextResponse.json(
      { error: "Invalid callback URL" },
      { status: 400 }
    );
  }

  // Validate the id (UUID)
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid UUID" }, { status: 400 });
  }

  // Validate the file
  const file = validatePDFFile(buffer, filename, mimetype);
  if (!file) {
    return NextResponse.json({ error: "Invalid PDF file" }, { status: 400 });
  }

  runJob(file, id, accessToken, callback);

  return NextResponse.json({ success: true }, { status: 200 });
}

async function runJob(
  file: File,
  id: UUID,
  accessToken: string,
  callback: string
): Promise<void> {
  let fileUploadedData: {
    file_key: string;
    file_name: string;
  };

  try {
    fileUploadedData = await uploadToS3(file);
  } catch (error) {
    console.error("error on load-pdf::uploadToS3", error);
    //   send NEGATIVE response to webhook since job completed with errors
    await sendWebhookResponseFailed(callback, id, accessToken);
    return;
  }

  let createChatResponse;
  try {
    createChatResponse = await axios.post("/api/create-chat", {
      file_key: fileUploadedData.file_key,
      file_name: fileUploadedData.file_name,
    });

    if (createChatResponse.data.error) {
      //   send NEGATIVE response to webhook since job completed with errors
      await sendWebhookResponseFailed(callback, id, accessToken);
      return;
    }
  } catch (error) {
    console.error("error on load-pdf, call to /api/create-chat", error);
    //   send NEGATIVE response to webhook since job completed with errors
    await sendWebhookResponseFailed(callback, id, accessToken);
    return;
  }

  //   send response to webhook since job completed fine
  await sendWebhookResponseSuccess(callback, id, accessToken);
  console.log(
    "🚀 ~ webhook succesfully called and file imported at endpoint:",
    callback
  );
  return;
}

async function sendWebhookResponseSuccess(
  endpoint: string,
  id: UUID,
  accessToken: string
): Promise<void> {
  try {
    await axios.post(endpoint, {
      id,
      accessToken,
      success: true,
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
  id: UUID,
  accessToken: string
): Promise<void> {
  try {
    await axios.post(endpoint, {
      id,
      accessToken,
      success: false,
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

function validatePDFFile(
  buf: Buffer,
  filename: string,
  mimetype: string
): File | null {
  // Check if the file is not null
  if (!buf) {
    return null;
  }

  // TODO convert Buffer to File
  const blob = new Blob([buf]);
  //   const fileName = 'example.pdf'; // Replace with your desired file name
  //     const fileType = 'application/pdf'; // Replace with the appropriate MIME type

  // Create a File from the Blob
  const file = new File([blob], filename, { type: mimetype });

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
