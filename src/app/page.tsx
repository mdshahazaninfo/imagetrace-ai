import Analyzer from "@/components/Analyzer";

export default function HomePage() {
  return <main>
    <section className="hero"><div><span className="heroBadge">Reverse image intelligence</span><h1>Trace an image to public sources.</h1><p>Find matching pages, OCR text, logos, landmarks and public web presence for a name you already know — with evidence-first scoring and privacy guardrails.</p></div><div className="heroPanel"><b>No face recognition</b><span>No home address or live-location discovery</span><span>No private social scraping</span><span>Raw uploads processed in memory</span></div></section>
    <Analyzer />
  </main>;
}
