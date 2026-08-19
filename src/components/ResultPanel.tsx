"use client";

import type { AnalysisReport, PresenceCategory } from "@/lib/types";

const categoryName: Record<PresenceCategory, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  wikipedia: "Wikipedia",
  official_website: "Official website",
  company_or_org: "Company / organization",
  news: "News / articles",
  other: "Other"
};

export default function ResultPanel({ report }: { report: AnalysisReport }) {
  const grouped = report.presence.reduce<Record<string, typeof report.presence>>((acc, item) => {
    (acc[item.category] ||= []).push(item); return acc;
  }, {});
  const visionOk = report.providerStatus.googleVision === "ok";
  const presenceSkipped = !report.confirmedPublicName;
  const searchConfigured = Object.entries(report.providerStatus)
    .filter(([k]) => !["googleVision", "wikipedia"].includes(k))
    .some(([, v]) => String(v).startsWith("ok via"));

  return (
    <div className="results">
      <section className="card">
        <div className="sectionHead"><div><p className="eyebrow">Analysis report</p><h2>Source intelligence</h2></div><span className="pill">{new Date(report.createdAt).toLocaleString()}</span></div>

        {(!visionOk || presenceSkipped || (report.confirmedPublicName && !searchConfigured)) && <div className="warning">
          <strong>Setup / search status:</strong>{" "}
          {!visionOk && <>Image intelligence is unavailable: {report.providerStatus.googleVision}. </>}
          {presenceSkipped && <>Social/web presence was skipped because no public name was supplied. </>}
          {report.confirmedPublicName && !searchConfigured && <>General web search provider is not configured or returned no provider status.</>}
        </div>}

        <div className="statsGrid">
          <Stat label="Web matches" value={visionOk ? (report.vision?.matches.length ?? 0) : null} />
          <Stat label="Logos" value={visionOk ? (report.vision?.logos.length ?? 0) : null} />
          <Stat label="Landmarks" value={visionOk ? (report.vision?.landmarks.length ?? 0) : null} />
          <Stat label="Presence results" value={presenceSkipped ? null : report.presence.length} />
        </div>
        {report.warnings.map((w, i) => <p key={i} className="warning">{w}</p>)}
      </section>

      {report.vision && <>
        <section className="card"><h3>Detected context</h3>
          <TagList title="Web entities" values={report.vision.webEntities.map((x) => x.description)} />
          <TagList title="Labels" values={report.vision.labels.map((x) => x.description)} />
          <TagList title="Logos" values={report.vision.logos.map((x) => x.description)} />
          <TagList title="Landmarks" values={report.vision.landmarks.map((x) => x.description)} />
        </section>
        <section className="card"><h3>Visible text (OCR)</h3><pre className="ocr">{report.vision.text || "No text detected."}</pre></section>
        <section className="card"><h3>Reverse-image sources</h3><div className="sourceList">
          {report.vision.matches.length ? report.vision.matches.map((m, i) => <a key={`${m.type}-${m.url}-${i}`} className="sourceItem" href={m.url} target="_blank" rel="noreferrer"><span className="sourceType">{m.type}</span><strong>{m.title || hostname(m.url)}</strong><small>{m.url}</small></a>) : <p className="muted">No matching source returned by Google Vision Web Detection.</p>}
        </div></section>
      </>}

      <section className="card"><h3>Safe image metadata</h3><dl className="details">
        <Detail k="Camera make" v={report.metadata.make} /><Detail k="Camera model" v={report.metadata.model} /><Detail k="Software" v={report.metadata.software} /><Detail k="Captured at" v={report.metadata.capturedAt} /><Detail k="GPS" v="Not processed or displayed" />
      </dl></section>

      <section className="card"><div className="sectionHead"><div><p className="eyebrow">Name-based search</p><h3>Public web presence</h3></div>{report.confirmedPublicName && <span className="pill">{report.confirmedPublicName}</span>}</div>
        {!report.confirmedPublicName && <p className="warning">Not run: enter the public name you already know. Image-only face-to-account matching is not performed.</p>}
        {report.confirmedPublicName && report.presence.length === 0 && <p className="muted">No public candidate was returned. This does not mean the account does not exist; the page may be private, unindexed, blocked from the search provider, or use a different display name.</p>}
        {Object.entries(grouped).map(([category, items]) => <div className="presenceGroup" key={category}><h4>{categoryName[category as PresenceCategory] ?? category}</h4>{items.map((item) => <a className="presenceItem" key={`${item.category}-${item.url}`} href={item.url} target="_blank" rel="noreferrer"><div><strong>{item.title}</strong><p>{item.snippet}</p><small>{item.provider}</small></div><div className="score"><b>{item.confidence}%</b><span>{item.confidenceLabel}</span></div></a>)}</div>)}
      </section>

      <section className="card"><h3>Provider status</h3><dl className="details">{Object.entries(report.providerStatus).map(([k,v]) => <Detail key={k} k={k} v={v} />)}</dl></section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) { return <div className="stat"><b>{value === null ? "—" : value}</b><span>{label}</span></div>; }
function TagList({ title, values }: { title: string; values: string[] }) { if (!values.length) return null; return <div className="tagBlock"><span>{title}</span><div className="tags">{values.slice(0, 15).map((v) => <span key={v}>{v}</span>)}</div></div>; }
function Detail({ k, v }: { k: string; v?: string | number }) { return <><dt>{k}</dt><dd>{v ?? "—"}</dd></>; }
function hostname(url: string) { try { return new URL(url).hostname; } catch { return url; } }
