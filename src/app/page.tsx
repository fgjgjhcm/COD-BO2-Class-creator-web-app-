import type { Metadata } from "next";
import { ClassBuilder } from "@/components/ClassBuilder";

export const metadata: Metadata = {
  title: {
    absolute: "BO2 Create-a-Class | Pick 10 Builder",
  },
  description:
    "Fan-made Black Ops II Create-a-Class builder with live Pick 10 allocation, wildcards, and shareable loadouts.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <ClassBuilder />;
}
