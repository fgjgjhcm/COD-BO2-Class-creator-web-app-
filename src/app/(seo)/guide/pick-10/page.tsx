import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BO2 Pick 10 System Explained",
  description:
    "How Black Ops II Pick 10 Create-a-Class works: allocation points, weapons, attachments, perks, equipment, and wildcards.",
  alternates: { canonical: "/guide/pick-10" },
};

export default function Pick10GuidePage() {
  return (
    <article className="seo-prose">
      <p className="seo-eyebrow">Guide</p>
      <h1 className="seo-title">BO2 Pick 10 Explained</h1>
      <p className="seo-lead">
        Black Ops II Create-a-Class gives you 10 allocation points. Every weapon,
        attachment, perk, lethal, tactical, and wildcard spends from that pool.
      </p>

      <h2 className="seo-section-title">What costs a point</h2>
      <ul>
        <li>Primary weapon</li>
        <li>Secondary weapon</li>
        <li>Each attachment</li>
        <li>Each perk</li>
        <li>Lethal equipment</li>
        <li>Tactical equipment</li>
        <li>Each wildcard</li>
      </ul>

      <h2 className="seo-section-title">Wildcards</h2>
      <p>
        Wildcards spend a point to unlock extra options — for example Primary
        Gunfighter adds a third primary attachment slot, Overkill lets you take
        two primary weapons, and Perk Greed doubles a perk tier. See the{" "}
        <Link href="/wildcards" style={{ color: "var(--accent)" }}>
          wildcard list
        </Link>{" "}
        for every option in this builder.
      </p>

      <h2 className="seo-section-title">Build a class</h2>
      <p>
        Use the{" "}
        <Link href="/builder" style={{ color: "var(--accent)" }}>
          Create-a-Class builder
        </Link>{" "}
        to allocate all 10 points, save up to five loadouts locally, and share a
        class URL. Browse{" "}
        <Link href="/weapons" style={{ color: "var(--accent)" }}>
          weapons
        </Link>
        ,{" "}
        <Link href="/attachments" style={{ color: "var(--accent)" }}>
          attachments
        </Link>
        , and{" "}
        <Link href="/perks" style={{ color: "var(--accent)" }}>
          perks
        </Link>{" "}
        for reference pages that link back into the builder.
      </p>
    </article>
  );
}
