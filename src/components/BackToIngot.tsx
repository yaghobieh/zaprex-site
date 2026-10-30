"use client";

import { useEffect, useState } from "react";

const KEY = "zaprex.fromIngot";
const INGOT_URL = "https://www.ingotide.com";
const INGOT_HOSTS = ["ingotide.com", "www.ingotide.com", "ingot-portal.vercel.app"];

/** IDEA-275: when the visitor came from Ingot (?from=ingot or an Ingot referrer), show a small "Back to Ingot" pill for the session. */
export function BackToIngot() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const from = (params.get("from") ?? params.get("ref") ?? "").toLowerCase();
      let refHost = "";
      try { refHost = document.referrer ? new URL(document.referrer).hostname : ""; } catch {}
      if (from === "ingot" || INGOT_HOSTS.includes(refHost)) sessionStorage.setItem(KEY, "1");
      setShow(sessionStorage.getItem(KEY) === "1");
    } catch {}
  }, []);

  if (!show) return null;
  return (
    <a
      href={INGOT_URL}
      data-testid="back-to-ingot"
      style={{ position: "fixed", left: 16, bottom: "calc(16px + env(safe-area-inset-bottom))", zIndex: 60, padding: "8px 14px", borderRadius: 999, background: "rgba(15,20,40,.85)", color: "#fff", border: "1px solid rgba(255,255,255,.18)", fontSize: 14, fontWeight: 600, textDecoration: "none", backdropFilter: "blur(8px)", boxShadow: "0 4px 18px rgba(0,0,0,.35)" }}
    >
      ← Back to Ingot
    </a>
  );
}
