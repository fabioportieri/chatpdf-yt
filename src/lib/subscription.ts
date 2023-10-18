import { getServerSession } from "next-auth/next";
import { db } from "./db";
import { userSubscriptions } from "./db/schema";
import { eq } from "drizzle-orm";
import { auth } from "./auth";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
export const checkSubscription = async () => {



  const session = await auth();
  if (!session || !session?.user) {
    return false;
  }


  const _userSubscriptions = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, session!.user!.name!));

  if (!_userSubscriptions[0]) {
    return false;
  }

  const userSubscription = _userSubscriptions[0];

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
    Date.now();

  return !!isValid;
};
