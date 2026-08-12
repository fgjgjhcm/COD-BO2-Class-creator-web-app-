import type { Metadata } from "next";
import { Suspense } from "react";
import { SeoShell } from "@/components/seo/SeoShell";
import { LoginClient } from "@/components/community/LoginClient";
import { getMyProfile } from "@/lib/community/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to publish and save BO2 Community loadouts.",
  robots: { index: false, follow: true },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ claim?: string }>;
}) {
  const params = await searchParams;
  const profile = await getMyProfile().catch(() => null);
  const needsUsername =
    params.claim === "1" || Boolean(profile && !profile.username);

  return (
    <SeoShell hideTabs>
      <Suspense fallback={<p className="seo-lead">Loading…</p>}>
        <LoginClient
          needsUsername={needsUsername}
          configured={isSupabaseConfigured()}
        />
      </Suspense>
    </SeoShell>
  );
}
