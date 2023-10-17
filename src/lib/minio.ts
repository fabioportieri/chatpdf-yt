import Minio from 'minio';

export const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME!;

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT!,
    port: +process.env.MINIO_PORT!,
    useSSL: new Boolean(process.env.MINIO_USESSL!).valueOf(),
    accessKey: process.env.MINIO_ACCESSKEY!,
    secretKey: process.env.MINIO_SECRETKEY!,
  })

  




