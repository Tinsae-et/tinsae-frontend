import type { Metadata } from "next";
import { ReturnsPage } from "@/components/returns/returns-page";

export const metadata: Metadata = {
  title: "Returns & warranty — Tinsae",
  description:
    "Understand how returns and warranties work on Tinsae: inspect before you pay, read each shop's terms, and know what Tinsae can and cannot do.",
};

export default function ReturnsRoute() {
  return <ReturnsPage />;
}
