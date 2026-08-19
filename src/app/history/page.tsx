"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AnalysisReport } from "@/lib/types";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function HistoryPage() {
  const [items, setItems] = useState<Array<{ id: string; file_name: string; confirmed_public_name?: string; result: AnalysisReport; created_at: string }>>([]);
  const [message, setMessage] = useState("Loading…");
  const supabase = useMemo(() => createBrowserSupabase(), []);

  useEffect(() => {
    (async () => {
      if (!supabase) return setMessage("Supabase is not configured.");
      const { data } = await supabase.auth.getSession();
      if (!data.session) return setMessage("Sign in to see saved history.");
      const res = await fetch("/api/history", { headers: { Authorization: `Bearer ${data.session.access_token}` } });
      const json = await res.json();
      if (!res.ok) return setMessage(json.error || "Could not load history.");
      setItems(json.items || []); setMessage("");
    })();
  }, [supabase]);

  return <main className="narrow"><section className="card"><div className="sectionHead"><div><p className="eyebrow">Saved analyses</p><h1>History</h1></div><Link className="buttonLink" href="/">New analysis</Link></div>{message && <p className="muted">{message}</p>}{items.map((item) => <div className="historyItem" key={item.id}><div><strong>{item.file_name || "Image"}</strong><span>{item.confirmed_public_name || "No public name"}</span></div><div><b>{item.result?.vision?.matches?.length ?? 0} matches</b><span>{new Date(item.created_at).toLocaleString()}</span></div></div>)}</section></main>;
}
