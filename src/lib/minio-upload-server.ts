import { MINIO_BUCKET_NAME, minioClient } from "./minio";
import { FILE_KEY_SEPARATOR } from "./utils";

// https://github.com/minio/minio-js
// https://min.io/docs/minio/linux/developers/javascript/API.html

export async function uploadToMinioServer({
  buffer,
  filename,
}: {
  buffer: Buffer;
  filename: string;
}): Promise<{ file_key: string; file_name: string }> {
  try {
    const file_key =
      "uploads/" +
      // Date.now().toString() +
      FILE_KEY_SEPARATOR +
      filename.replace(" ", "-");

    // let bodyFile: Buffer = Buffer.from(await file.arrayBuffer());

    console.log(
      "🚀 ~ uploadToMINIO ~ upload file_key:",
      file_key,
      "buffer length:",
      buffer.length,
      "filename",
      filename
    );

    // https://min.io/docs/minio/linux/developers/javascript/API.html#putObject
    // putObject(bucketName: string, objectName: string, stream: ReadableStream | Buffer | string, metaData?: ItemBucketMetadata): Promise<UploadedObjectInfo>;
    // fPutObject(bucketName: string, objectName: string, filePath: string, metaData?: ItemBucketMetadata): Promise<UploadedObjectInfo>;

    // const client = new minio.Client({
    //   endPoint: 'localhost',
    //   port: 9040,
    //   useSSL: false,
    //   accessKey: 'pDLNypgWK4n4IidH',
    //   secretKey: '6pvgqJI9Bhxn0bEYp5NEk8xS8wDHW4ox',
    // })

    const data = await minioClient.putObject(
      MINIO_BUCKET_NAME,
      file_key,
      buffer
    );

    console.log("🚀 ~ uploadToMINIO ~ data:", data);
    return {
      file_key,
      file_name: filename,
    };
  } catch (error) {
    console.error("Error uploading to Minio:", error);
    throw error; // Rethrow the error for further handling
  }
}

/*


object-uploader.mjs:23 Uncaught (in promise) TypeError: Class extends value undefined is not a constructor or null
    at eval (webpack-internal:///(:3002/app-pages-browser)/./node_modules/minio/dist/esm/object-uploader.mjs:32:66)
    at (app-pages-browser)/./node_modules/minio/dist/esm/object-uploader.mjs (page.js:2697:1)
    at options.factory (webpack.js?v=1697648857968:716:31)
    at __webpack_require__ (webpack.js?v=1697648857968:37:33)
    at fn (webpack.js?v=1697648857968:371:21)
    at eval (webpack-internal:///(:3002/app-pages-browser)/./node_modules/minio/dist/esm/minio.mjs:50:79)
    at (app-pages-browser)/./node_modules/minio/dist/esm/minio.mjs (page.js:2675:1)
    at options.factory (webpack.js?v=1697648857968:716:31)
    at __webpack_require__ (webpack.js?v=1697648857968:37:33)
    at fn (webpack.js?v=1697648857968:371:21)
    at eval (webpack-internal:///(:3002/app-pages-browser)/./src/lib/minio.ts:6:63)
    at (app-pages-browser)/./src/lib/minio.ts (page.js:876:1)
    at options.factory (webpack.js?v=1697648857968:716:31)
    at __webpack_require__ (webpack.js?v=1697648857968:37:33)
    at fn (webpack.js?v=1697648857968:371:21)
    at eval (webpack-internal:///(:3002/app-pages-browser)/./src/lib/minio-upload.ts:6:64)

*/
