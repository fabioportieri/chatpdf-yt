import { NodeFile } from "@/app/api/load-pdf/route";
import { PutObjectCommandOutput, S3 } from "@aws-sdk/client-s3";

import { FILE_KEY_SEPARATOR } from "./utils";
import Minio, { UploadedObjectInfo } from 'minio';
import { MINIO_BUCKET_NAME, minioClient } from "./minio";

// https://github.com/minio/minio-js
// https://min.io/docs/minio/linux/developers/javascript/API.html


export async function uploadToMinioServer(
  file: NodeFile | File
): Promise<{ file_key: string; file_name: string }> {
  try {

    const file_key =
      "uploads/" +
      Date.now().toString() +
      FILE_KEY_SEPARATOR +
      file.name.replace(" ", "-");

    let bodyFile: Buffer = Buffer.from(await file.arrayBuffer());

    // https://min.io/docs/minio/linux/developers/javascript/API.html#putObject
    // putObject(bucketName: string, objectName: string, stream: ReadableStream | Buffer | string, metaData?: ItemBucketMetadata): Promise<UploadedObjectInfo>;
    // fPutObject(bucketName: string, objectName: string, filePath: string, metaData?: ItemBucketMetadata): Promise<UploadedObjectInfo>;
    const data: UploadedObjectInfo = await minioClient.putObject(MINIO_BUCKET_NAME, file_key, bodyFile);
    

    console.log("🚀 ~ uploadToMINIO ~ data:", data);
    return {
      file_key,
      file_name: file.name,
    };
  } catch (error) {
    console.error("Error uploading to Minio:", error);
    throw error; // Rethrow the error for further handling
  }
}


