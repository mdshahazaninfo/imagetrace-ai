import { createVerifierSupabase } from "@/lib/supabase/server";

export async function userFromAuthorization(request: Request): Promise<{ id: string; email?: string } | null> {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return null;
  const client = createVerifierSupabase();
  if (!client) return null;
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email };
}
