import { redirect } from "next/navigation";

/**
 * Redirects merchant /shop/dashboard/inquiries/:id to the dashboard inquiries page
 * with query param ?id=:id so the detail drawer opens automatically.
 */
export default async function ShopInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/shop/dashboard/inquiries?id=${encodeURIComponent(id)}`);
}
