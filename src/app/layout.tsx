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
  metadataBase: new URL("https://www.bo2loadouts.com"),
  title: {
    default: "BO2 Loadouts | Black Ops II Create-a-Class",
    template: "%s | BO2 Loadouts",
  },
  description:
    "Fan-made Black Ops II Create-a-Class and Pick 10 loadout builder. Browse weapons, attachments, perks, equipment, and wildcards.",
  openGraph: {
    type: "website",
    siteName: "BO2 Loadouts",
    title: "BO2 Loadouts | Black Ops II Create-a-Class",
    description:
      "Fan-made Black Ops II Create-a-Class and Pick 10 loadout builder. Browse weapons, attachments, perks, equipment, and wildcards.",
    url: "https://www.bo2loadouts.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "BO2 Loadouts | Black Ops II Create-a-Class",
    description:
      "Fan-made Black Ops II Create-a-Class and Pick 10 loadout builder. Browse weapons, attachments, perks, equipment, and wildcards.",
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
