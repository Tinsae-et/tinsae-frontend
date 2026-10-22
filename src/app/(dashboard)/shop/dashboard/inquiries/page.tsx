import { getShopInquiries } from "@/lib/api/server";
import { InquiriesPage } from "@/components/shop/dashboard/inquiries/inquiries-page";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeadsPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") {
      params.set(key, value);
    } else {
      value?.forEach((item) => params.append(key, item));
    }
  }

  const queryString = params.toString();
  const path = `inquiries/shop/${queryString ? `?${queryString}` : ""}`;
  const inquiries = await getShopInquiries(path);

  return (
    <section>
      <InquiriesPage inquiries={inquiries} />
    </section>
  );
}