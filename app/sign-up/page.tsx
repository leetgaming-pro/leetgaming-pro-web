import { redirect } from "next/navigation";

/**
 * Server-side redirect from /sign-up to /signup for URL consistency.
 * Uses Next.js server redirect (HTTP 307) to avoid client-side flash.
 */
export default function SignUpRedirect() {
  redirect("/signup");
}
