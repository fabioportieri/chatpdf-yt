import { S3 } from "@aws-sdk/client-s3";
import fs from "fs";
import { MINIO_BUCKET_NAME, minioClient } from "./minio";


export async function downloadFromMinio(file_key: string): Promise<string> {

  const file_name = `/tmp/fabio${Date.now().toString()}.pdf`;
  await minioClient.fGetObject(MINIO_BUCKET_NAME, file_key, file_name);

  return file_name;
};




function uint8ArrayToBlob(uint8Array: Uint8Array, mimeType: string): Blob | null {
  if (!uint8Array || !uint8Array.length) return null;
  return new Blob([uint8Array], { type: mimeType });
}

export async function downloadFromMinioAndConvertToBlob(file_key: string): Promise<Blob | null> {

  const file_name = await downloadFromMinio(file_key);

  const fileData = await fs.promises.readFile(file_name);

  // for reading metadata from minio i should use .getObject not fGetObject
  // https://github.com/minio/minio-js/issues/900

  return uint8ArrayToBlob(new Uint8Array(fileData), 'application/pdf');
};

