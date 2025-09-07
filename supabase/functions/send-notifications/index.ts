import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const adminUser = authData.user;

    // Verify super admin via profiles table and email
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, role, email")
      .eq("id", adminUser.id)
      .single();

    if (
      profileErr ||
      !profile ||
      profile.role !== "super_admin" ||
      profile.email !== "royan.shaw@gmail.com"
    ) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { user_ids, subject, message, delivery_method } = await req.json();

    if (!Array.isArray(user_ids) || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_ids, subject, message" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (delivery_method !== "email") {
      return new Response(
        JSON.stringify({ error: "Only email delivery is supported in this endpoint" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: profiles, error: fetchErr } = await supabase
      .from("profiles")
      .select("id, name, email")
      .in("id", user_ids);

    if (fetchErr) {
      return new Response(JSON.stringify({ error: "Error fetching user data" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured in Edge Function secrets" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);
    const errors: string[] = [];

    for (const p of profiles ?? []) {
      const personalized = message
        .replace("{user_name}", p.name || "User")
        .replace("{user_email}", p.email ?? "");

      try {
        await resend.emails.send({
          from: "Traderama <onboarding@resend.dev>",
          to: [p.email!],
          subject,
          html: `<p>${personalized.replace(/\n/g, "<br>")}</p>`,
          text: personalized,
        });
      } catch (e: any) {
        errors.push(`Email failed for ${p.email}: ${e?.message || e}`);
      }
    }

    // Try to update the latest processing message matching this subject
    const { data: latestMsg } = await supabase
      .from("messages")
      .select("id")
      .eq("super_admin_id", adminUser.id)
      .eq("subject", subject)
      .eq("status", "processing")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestMsg?.id) {
      await supabase
        .from("messages")
        .update({
          status: errors.length ? "archived" : "sent",
          error: errors.length ? errors.join("; ") : null,
          sent_at: new Date().toISOString(),
        })
        .eq("id", latestMsg.id);
    }

    return new Response(
      JSON.stringify({ message: "Email processing complete", errors }),
      {
        status: errors.length ? 207 : 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("send-notifications error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
