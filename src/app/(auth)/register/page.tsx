import { permanentRedirect } from "next/navigation";

/** See login/page.tsx — kept so older links resolve. */
export default async function RegisterRedirect({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  permanentRedirect(next ? `/signup?next=${encodeURIComponent(next)}` : "/signup");
}
