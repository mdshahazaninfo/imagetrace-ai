"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function Nav() {
  const [email, setEmail] = useState<string | null>(null);
  const supabase = useMemo(() => createBrowserSupabase(), []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setEmail(null);
    window.location.href = "/";
  }

  return (
    <header className="nav">
      <Link href="/" className="brand"><span className="brandMark">◉</span> ImageTrace AI</Link>
      <nav className="navLinks">
        <Link href="/">Analyze</Link>
        <Link href="/history">History</Link>
        {email ? <button className="linkButton" onClick={signOut}>Sign out</button> : <Link href="/login">Sign in</Link>}
      </nav>
    </header>
  );
}
