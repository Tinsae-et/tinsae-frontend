import type { Metadata } from "next";
import { PressPage } from "@/components/press/press-page";

export const metadata: Metadata = {
  title: "Press & media — Tinsae",
  description:
    "Tinsae's media kit: approved boilerplate, a checked fact sheet, downloadable logos and palette, and a press contact who answers.",
};

export default function PressRoute() {
  return <PressPage />;
}
