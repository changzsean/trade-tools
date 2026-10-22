import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

type AuthenticatedClient = {
  client: SupabaseClient;
  user: User;
};

export function getSupabaseForAccessToken(accessToken: string): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export async function authenticateProductCopyRequest(request: Request): Promise<AuthenticatedClient | null> {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const client = getSupabaseForAccessToken(match[1].trim());
  if (!client) return null;

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return { client, user: data.user };
}
