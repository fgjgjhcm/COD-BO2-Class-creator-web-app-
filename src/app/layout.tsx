import type { Metadata, Viewport } from "next";
import { Saira_Condensed, Saira_Extra_Condensed } from "next/font/google";
import { LoadingProvider } from "@/components/LoadingScreen";
import { UiSoundProvider } from "@/components/UiSoundProvider";
import { AfterlifeProvider } from "@/components/easter-eggs/AfterlifeProvider";
import { TeddyBearLink } from "@/components/easter-eggs/TeddyBearLink";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://bo2loadouts.com"),
  title: {
    default: "BO2 Create-a-Class | Pick 10 Builder",
    template: "%s | BO2 Loadouts",
  },
  description:
    "Fan-made Black Ops II Create-a-Class builder with live Pick 10 allocation, wildcards, and shareable loadouts.",
  openGraph: {
    type: "website",
    siteName: "BO2 Loadouts",
    title: "BO2 Create-a-Class | Pick 10 Builder",
    description:
      "Fan-made Black Ops II Create-a-Class builder with live Pick 10 allocation, wildcards, and shareable loadouts.",
    url: "https://bo2loadouts.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "BO2 Create-a-Class | Pick 10 Builder",
    description:
      "Fan-made Black Ops II Create-a-Class builder with live Pick 10 allocation, wildcards, and shareable loadouts.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <LoadingProvider>
          <UiSoundProvider>
            <AfterlifeProvider>
              <div className="app-shell">{children}</div>
              <TeddyBearLink />
            </AfterlifeProvider>
          </UiSoundProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
