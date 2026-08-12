import type { Metadata } from "next";
import { EasterEggsInventory } from "@/components/easter-eggs/EasterEggsInventory";

export const metadata: Metadata = {
  title: "Easter Eggs",
  description:
    "Hidden BO2 Loadouts easter eggs. Unlock silhouettes by exploring the Create-a-Class builder.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/easter-eggs" },
};

export default function EasterEggsPage() {
  return <EasterEggsInventory />;
}
