"use client";

import { redirect } from "next/navigation";

/**
 * Legacy home variant - redirects to main landing page
 */
export default function Home4Page() {
  redirect("/");
}