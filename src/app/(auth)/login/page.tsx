import { permanentRedirect } from "next/navigation";

/**
 * /login and /register predate the design, which names the routes /signin and
 * /signup. Kept as redirects so older links (and the ticket's own wording)
 * still land somewhere.
 */
export default async function LoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  permanentRedirect(next ? `/signin?next=${encodeURIComponent(next)}` : "/signin");
}
