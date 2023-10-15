import AES from "crypto-js/aes";
import * as CryptoJS from 'crypto-js';

export const secretPass = CryptoJS.enc.Utf8.parse(process.env.NUTPROJECT_ACCESS_TOKEN_SECRET!);
export const accessTokenPlain = process.env.NUTPROJECT_ACCESS_TOKEN_PLAIN!;
export const accessTokenIV = CryptoJS.enc.Utf8.parse(process.env.NUTPROJECT_ACCESS_TOKEN_IV!);

export function encryptData(data: string): string {
  const res = AES.encrypt(data, secretPass, {
    iv: accessTokenIV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();

  return res;
}

export function decryptData(ciphertext: string): string {
  const bytes = AES.decrypt(ciphertext, secretPass, {
    iv: accessTokenIV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  const res = bytes.toString(CryptoJS.enc.Utf8);
  return res;
}

// https://gist.github.com/gimelfarb/da6264e5ee4348c11450879258641580



// test: https://jsfiddle.net/4q79tcky/2/