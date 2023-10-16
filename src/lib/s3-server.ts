import { S3 } from "@aws-sdk/client-s3";
import fs from "fs";
export async function downloadFromS3(file_key: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const s3 = new S3({
        region: "eu-north-1",
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
        },
      });
      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: file_key,
      };

      const obj = await s3.getObject(params);
      const file_name = `/tmp/fabio${Date.now().toString()}.pdf`;

      if (obj.Body instanceof require("stream").Readable) {
        // AWS-SDK v3 has some issues with their typescript definitions, but this works
        // https://github.com/aws/aws-sdk-js-v3/issues/843
        //open the writable stream and write the file
        const file = fs.createWriteStream(file_name);
        file.on("open", function (fd) {
          // @ts-ignore
          obj.Body?.pipe(file).on("finish", () => {
            return resolve(file_name);
          });
        });
        // obj.Body?.pipe(fs.createWriteStream(file_name));
      }
    } catch (error) {
      console.error(error);
      reject(error);
      return null;
    }
  });
}

function uint8ArrayToBlob(uint8Array: Uint8Array, mimeType: string) {
  return new Blob([uint8Array], { type: mimeType });
}

export async function downloadFromS3AndConvertToBase64(fileKey: string): Promise<Blob | null> {
  return new Promise(async (resolve, reject) => {
    try {
      const s3 = new S3({
        region: 'eu-north-1',
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
        },
      });

      const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: fileKey,
      };

      const obj = await s3.getObject(params);
      const file_name = `/tmp/fabio${Date.now().toString()}.pdf`;
      if (obj.Body instanceof require("stream").Readable) {
        // AWS-SDK v3 has some issues with their typescript definitions, but this works
        // https://github.com/aws/aws-sdk-js-v3/issues/843
        //open the writable stream and write the file
        const file = fs.createWriteStream(file_name);
        file.on("open", function (fd) {
          // @ts-ignore

          obj.Body!.transformToByteArray().then((byteArray) => {
            if (byteArray instanceof Uint8Array) {

              console.log("🚀🚀🚀valid byteArray:");
            } else {
              console.log("🚀🚀🚀innnnnvalid byteArray:");
            }
            const blob = uint8ArrayToBlob(byteArray, 'application/pdf');

            console.log("🚀 ~ file: s3-server.ts:82 ~ obj.Body!.transformToByteArray ~ blob:", blob)
            return resolve(blob);
          });

        });
        // obj.Body?.pipe(fs.createWriteStream(file_name));
      } else {
        reject(new Error('Object body is not a readable stream.'));
      }
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

// downloadFromS3("uploads/1693568801787chongzhisheng_resume.pdf");

