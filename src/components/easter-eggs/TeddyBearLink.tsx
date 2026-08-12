"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  EASTER_EGG_UNLOCK_EVENT,
  EASTER_EGG_VIEWED_EVENT,
  hasUnseenEasterEggs,
} from "@/lib/easterEggs";

export function TeddyBearLink() {
  const pathname = usePathname();
  const onEggsPage = pathname === "/easter-eggs";
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    const sync = () => setPulsing(hasUnseenEasterEggs());
    sync();
    window.addEventListener(EASTER_EGG_UNLOCK_EVENT, sync);
    window.addEventListener(EASTER_EGG_VIEWED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EASTER_EGG_UNLOCK_EVENT, sync);
      window.removeEventListener(EASTER_EGG_VIEWED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Link
      href="/easter-eggs"
      className={[
        "teddy-float",
        onEggsPage ? "is-active" : "",
        pulsing ? "is-pulsing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={pulsing ? "New easter egg unlocked" : "Easter eggs"}
      title={pulsing ? "New easter egg unlocked" : "Easter eggs"}
    >
      <span className="teddy-float-glow" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/easter-eggs/teddybear.png"
        alt=""
        width={72}
        height={72}
        draggable={false}
      />
    </Link>
  );
}
