import type { Subscription } from "@/types/replay-api/subscriptions.sdk";

const PRO_WALLET_NAME_TOKENS = ["pro", "elite", "team", "business"];
const PRO_WALLET_KIND_TOKENS = ["pro", "team", "business", "custom"];

export function isProWalletSubscription(
  subscription: Subscription | null | undefined,
): boolean {
  if (!subscription) {
    return false;
  }

  if (subscription.is_pro || subscription.is_elite) {
    return true;
  }

  const planKind = subscription.plan?.kind?.toLowerCase() || "";
  if (PRO_WALLET_KIND_TOKENS.includes(planKind)) {
    return true;
  }

  const planName = subscription.plan?.name?.toLowerCase() || "";
  return PRO_WALLET_NAME_TOKENS.some((token) => planName.includes(token));
}

export function getWalletRoute(
  subscription: Subscription | null | undefined,
): "/wallet" | "/wallet/pro" {
  return isProWalletSubscription(subscription) ? "/wallet/pro" : "/wallet";
}