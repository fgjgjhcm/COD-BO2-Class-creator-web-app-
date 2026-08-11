import type { Metadata } from "next";
import { Saira_Condensed, Saira_Extra_Condensed } from "next/font/google";
import { LoadingProvider } from "@/components/LoadingScreen";
import "./globals.css";

// Agency FB Bold is what BO2 uses, but it's commercial/licensed.
// Saira Extra Condensed is the closest free condensed industrial match.
const display = Saira_Extra_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Saira_Condensed({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BO2 Create-a-Class | Pick 10 Builder",
  description:
    "Fan-made Black Ops II Create-a-Class builder with live Pick 10 allocation, wildcards, and shareable loadouts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <LoadingProvider>
          <div className="app-shell">{children}</div>
        </LoadingProvider>
      </body>
    </html>
  );
}
