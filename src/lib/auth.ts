import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { cookies } from "next/headers";

export async function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  console.log("calling auth ", args);

  const url = process.env.NEXT_PUBLIC_APP_URL;
  const apiUrl = new URL(`${url}/api/userid`);
  const response = await fetch(apiUrl, {
    headers: { Cookie: cookies().toString() },
  });
  const data = await response.json();
  return data;
}
