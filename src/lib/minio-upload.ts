import { NodeFile } from "@/app/api/load-pdf/route";
import { PutObjectCommandOutput, S3 } from "@aws-sdk/client-s3";
import { FILE_KEY_SEPARATOR } from "./utils";
// import { FetchHttpHandler } from "@smithy/fetch-http-handler";

// TODO make it DRY with s3-upload-client, had to split since Can't use Buffer in browser and can't use File in server nodejs !

export async function uploadToS3Server(
  file: NodeFile
): Promise<{ file_key: string; file_name: string }> {
  try {
    const s3 = new S3({
      region: "eu-north-1",
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
      // requestHandler: new FetchHttpHandler({ keepAlive: false }) // https://github.com/aws/aws-sdk-js-v3/issues/5334
    });

    const file_key =
      "uploads/" +
      Date.now().toString() +
      FILE_KEY_SEPARATOR +
      file.name.replace(" ", "-");

    let bodyFile: Buffer = Buffer.from(await file.arrayBuffer());

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
      Body: bodyFile,
    };

    const data: PutObjectCommandOutput = await s3.putObject(params);

    console.log("🚀 ~ file: s3.ts:23 ~ uploadToS3 ~ data:", data);
    return {
      file_key,
      file_name: file.name,
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error; // Rethrow the error for further handling
  }
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${file_key}`;
  return url;
}
