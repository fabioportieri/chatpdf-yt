import { Client } from 'minio';

export const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME!;

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: +process.env.MINIO_PORT!,
  useSSL: process.env.MINIO_USESSL === 'true',
  accessKey: process.env.MINIO_ACCESSKEY!,
  secretKey: process.env.MINIO_SECRETKEY!,
})







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
