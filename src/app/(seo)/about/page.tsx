import type { Metadata } from "next";
import Link from "next/link";
import { AfterlifeStation } from "@/components/easter-eggs/AfterlifeStation";

export const metadata: Metadata = {
  title: "About",
  description:
    "About BO2 Loadouts — a fan-made Black Ops II Create-a-Class / Pick 10 builder. Not affiliated with Activision or Treyarch.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <article className="seo-prose">
        <p className="seo-eyebrow">BO2 Loadouts</p>
        <h1 className="seo-title">About</h1>
        <p className="seo-lead">
          BO2 Loadouts is an unofficial, fan-made Create-a-Class tool for Call of
          Duty: Black Ops II.
        </p>
        <p>
          It recreates the Pick 10 allocation system in the browser so you can
          theory-craft loadouts, save five classes locally, and share builds with
          a link. Game icons and names are used for reference only.
        </p>
        <p>
          This project is{" "}
          <strong>
            not affiliated with, endorsed by, or connected to
          </strong>{" "}
          Activision Publishing, Inc., Treyarch, or Call of Duty. Call of Duty and
          Black Ops are trademarks of their respective owners.
        </p>
        <p>
          <Link href="/builder" style={{ color: "var(--accent)" }}>
            Open the class builder
          </Link>
          {" · "}
          <Link href="/guide/pick-10" style={{ color: "var(--accent)" }}>
            Pick 10 guide
          </Link>
        </p>
      </article>

      {/* Quiet MotD junction — Afterlife hold prompt appears when this is in view */}
      <div className="about-afterlife-corner">
        <AfterlifeStation />
      </div>
    </>
  );
}
