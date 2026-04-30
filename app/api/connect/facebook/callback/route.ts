import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/settings?error=facebook_denied`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("facebook_oauth_state")?.value;
  cookieStore.delete("facebook_oauth_state");

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${appUrl}/settings?error=facebook_state_mismatch`);
  }

  // Exchange code for a short-lived user token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?${new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      redirect_uri: `${appUrl}/api/connect/facebook/callback`,
      code,
    })}`
  );

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/settings?error=facebook_token_failed`);
  }

  const { access_token: shortToken } = await tokenRes.json();

  // Exchange for a long-lived page token (60 days)
  const longLivedRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?${new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: process.env.FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      fb_exchange_token: shortToken,
    })}`
  );

  const { access_token: longToken } = await longLivedRes.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${appUrl}/login`);

  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

  await supabase
    .from("businesses")
    .update({
      facebook_access_token: longToken,
      facebook_token_expires_at: expiresAt,
    })
    .eq("owner_id", user.id);

  return NextResponse.redirect(`${appUrl}/settings?connected=facebook`);
}
