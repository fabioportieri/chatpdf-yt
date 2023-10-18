import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToAscii(inputString: string) {
  // remove non ascii characters
  const asciiString = inputString.replace(/[^\x00-\x7F]+/g, "");
  return asciiString;
}

export const FILE_KEY_SEPARATOR = "-sep-";

// export function handleSession(req: Request, res: Response): string |  NextResponse<JsonBody> {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return NextResponse.json({ error: "unauthorized" }, { status: 401 });
//   }
//   const userId = session?.user?.name;
//   if (!userId) {
//     return NextResponse.json({ error: "user missing" }, { status: 403 });
//   }
//   console.log("🚀 ~ file DEBUGGING session:", session);
// }