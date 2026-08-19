"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ResultPanel from "@/components/ResultPanel";
import type { AnalysisReport } from "@/lib/types";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function Analyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [publicName, setPublicName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const supabase = useMemo(() => createBrowserSupabase(), []);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) return setError("Choose an image first.");
    setBusy(true); setError(""); setReport(null);
    const form = new FormData(); form.set("image", file); form.set("confirmedPublicName", publicName.trim());
    const headers: Record<string, string> = {};
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`;
    }
    try {
      const res = await fetch("/api/analyze", { method: "POST", body: form, headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setReport(data as AnalysisReport);
    } catch (e) { setError(e instanceof Error ? e.message : "Analysis failed."); }
    finally { setBusy(false); }
  }

  return <>
    <form onSubmit={submit} className="analyzerGrid">
      <section className="card uploadCard">
        <p className="eyebrow">Step 1</p><h2>Upload an image</h2>
        <label className="dropzone">
          {preview ? <Image src={preview} alt="Selected upload preview" fill unoptimized className="previewImage" /> : <div><b>Drop or choose an image</b><span>JPG, PNG, WEBP · up to configured limit</span></div>}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        {file && <p className="fileMeta">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</p>}
      </section>

      <section className="card">
        <p className="eyebrow">Step 2 · optional</p><h2>Search public presence</h2>
        <label>Public name you already know<input value={publicName} onChange={(e) => setPublicName(e.target.value)} placeholder="e.g. Jane Example" maxLength={120} /></label>
        <p className="muted">This field enables Wikipedia, Facebook, Instagram, official-site and news search. The app does not infer a name from a face.</p>
        <button type="submit" disabled={busy || !file}>{busy ? "Analyzing sources…" : "Analyze image"}</button>
        {error && <p className="error">{error}</p>}
      </section>
    </form>
    {report && <ResultPanel report={report} />}
  </>;
}
