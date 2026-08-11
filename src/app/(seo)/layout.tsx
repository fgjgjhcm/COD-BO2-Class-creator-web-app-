import { SeoShell } from "@/components/seo/SeoShell";
import type { ReactNode } from "react";

export default function SeoLayout({ children }: { children: ReactNode }) {
  return <SeoShell>{children}</SeoShell>;
}
