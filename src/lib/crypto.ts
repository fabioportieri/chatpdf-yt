import AES from "crypto-js/aes";

export const secretPass = process.env.NUTPROJECT_ACCESS_TOKEN_SECRET!;
export const accessTokenPlain = process.env.NUTPROJECT_ACCESS_TOKEN_PLAIN!;

export function encryptData(data: string): string {
  const res = AES.encrypt(JSON.stringify(data), secretPass).toString();

  return res;
}

export function decryptData(ciphertext: string): string {
  const bytes = AES.decrypt(ciphertext, secretPass);
  const res = bytes.toString(CryptoJS.enc.Utf8);
  return res;
}
