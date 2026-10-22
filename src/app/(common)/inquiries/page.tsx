import { redirect } from "next/navigation";

/**
 * Redirects /inquiries to /messages.
 */
export default function InquiriesPage() {
  redirect("/messages");
}

