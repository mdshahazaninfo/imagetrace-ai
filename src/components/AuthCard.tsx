"use client";

import { FormEvent, useMemo, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function AuthCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = useMemo(() => createBrowserSupabase(), []);

  async function run(mode: "signin" | "signup") {
    if (!supabase) return setMessage("Supabase Auth is not configured.");
    setBusy(true); setMessage("");
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === "signup" && !result.data.session) return setMessage("Check your email to confirm the account.");
    window.location.href = "/";
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await run("signin");
  }

  return (
    <form className="card authCard" onSubmit={onSubmit}>
      <h1>Sign in</h1>
      <p className="muted">Sign in to save and review your analysis history.</p>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required /></label>
      <div className="buttonRow">
        <button disabled={busy} type="submit">{busy ? "Working…" : "Sign in"}</button>
        <button disabled={busy} type="button" className="secondary" onClick={() => run("signup")}>Create account</button>
      </div>
      {message && <p className="notice">{message}</p>}
    </form>
  );
}
