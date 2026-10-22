import { redirect } from "next/navigation";

/**
 * Redirects legacy /inquiries/:id notification URLs directly to the messaging thread.
 */
export default async function InquiryRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/messages?inquiry=${encodeURIComponent(id)}`);
}

