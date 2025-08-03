import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { Client } from "@polygon.io/client-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, timeframe, startDate, endDate } = await req.json();

    // Validate inputs
    if (!symbol || typeof symbol !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid or missing symbol" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validTimeframes = ["1d", "1w", "1m"];
    if (!timeframe || !validTimeframes.includes(timeframe)) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing timeframe. Must be '1d', '1w', or '1m'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!startDate || !endDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing startDate/endDate. Must be in YYYY-MM-DD format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const POLYGON_API_KEY = Deno.env.get("POLYGON_API_KEY");
    if (!POLYGON_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Polygon API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Polygon.io client
    const polygon = new Client({ apiKey: POLYGON_API_KEY });

    // Map timeframe to Polygon.io timespan
    const timespanMap: { [key: string]: string } = {
      "1d": "day",
      "1w": "week",
      "1m": "month",
    };
    const timespan = timespanMap[timeframe];
    const multiplier = 1; // Fixed multiplier for simplicity, adjust if needed

    // Fetch aggregate bars using Polygon.io client
    const data = await polygon.stocks.aggregates(symbol, multiplier, timespan, startDate, endDate);

    if (data.status !== "OK") {
      throw new Error(data.error || "Failed to fetch data from Polygon.io");
    }

    // Optionally, use Supabase client for additional operations (e.g., store data)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});