import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(body: Record<string, unknown>) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI gateway not configured");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
  if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in Settings → Workspace → Usage.");
  if (!res.ok) throw new Error(`AI error: ${res.status}`);
  return res.json();
}

// ---------- Disease analysis ----------
export const analyzeDisease = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { imageBase64: string; cropHint?: string; language?: string }) =>
    z.object({
      imageBase64: z.string().min(50).max(15_000_000),
      cropHint: z.string().max(120).optional(),
      language: z.string().max(40).optional(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const lang = data.language || "English";
    const tools = [{
      type: "function",
      function: {
        name: "report_diagnosis",
        description: "Report a structured crop disease diagnosis.",
        parameters: {
          type: "object",
          properties: {
            crop: { type: "string" },
            disease: { type: "string" },
            confidence: { type: "string", enum: ["low", "medium", "high"] },
            severity: { type: "string", enum: ["mild", "moderate", "severe"] },
            symptoms: { type: "array", items: { type: "string" } },
            causes: { type: "array", items: { type: "string" } },
            treatment: { type: "array", items: { type: "string" } },
            prevention: { type: "array", items: { type: "string" } },
            encouragement: { type: "string", description: "A warm, empathetic note to the farmer acknowledging their hard work." },
          },
          required: ["crop","disease","confidence","severity","symptoms","treatment","prevention","encouragement"],
          additionalProperties: false,
        },
      },
    }];

    const ai = await callAI({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: `You are AgriVision AI, an expert plant pathologist who speaks with warmth and respect for farmers. If the image is not a plant/crop, set disease to 'Not a crop image' and ask kindly for a clearer photo. IMPORTANT: All free-text fields (disease, symptoms, causes, treatment, prevention, encouragement) MUST be written in ${lang}. Keep the 'crop' field as the common name in ${lang}.` },
        { role: "user", content: [
          { type: "text", text: `Analyze this crop photo for disease.${data.cropHint ? " Hint: " + data.cropHint : ""} Provide treatment a small farmer can act on. Be encouraging.` },
          { type: "image_url", image_url: { url: data.imageBase64 } },
        ]},
      ],
      tools,
      tool_choice: { type: "function", function: { name: "report_diagnosis" } },
    });

    const args = ai.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("AI did not return a diagnosis. Please try another photo.");
    const result = JSON.parse(args);

    await supabase.from("analyses").insert({
      user_id: userId,
      type: "disease",
      title: `${result.crop} — ${result.disease}`,
      result,
      input_summary: { cropHint: data.cropHint ?? null },
    });

    return result;
  });

// ---------- Yield prediction ----------
export const predictYield = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    crop: string; areaHectares: number; soilType: string;
    rainfallMm: number; season: string; region?: string; notes?: string; language?: string;
  }) => z.object({
    crop: z.string().min(1).max(60),
    areaHectares: z.number().min(0.01).max(100000),
    soilType: z.string().min(1).max(40),
    rainfallMm: z.number().min(0).max(10000),
    season: z.string().min(1).max(40),
    region: z.string().max(80).optional(),
    notes: z.string().max(500).optional(),
    language: z.string().max(40).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const lang = data.language || "English";
    const tools = [{
      type: "function",
      function: {
        name: "report_yield",
        parameters: {
          type: "object",
          properties: {
            estimatedYieldTonnes: { type: "number" },
            yieldPerHectare: { type: "number" },
            confidence: { type: "string", enum: ["low","medium","high"] },
            keyFactors: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            encouragement: { type: "string" },
          },
          required: ["estimatedYieldTonnes","yieldPerHectare","confidence","keyFactors","recommendations","encouragement"],
          additionalProperties: false,
        },
      },
    }];

    const ai = await callAI({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: `You are AgriVision AI's yield estimator. Use agronomy knowledge to estimate realistic yields for small farms. Speak to farmers with empathy and acknowledge struggles. IMPORTANT: All free-text fields (keyFactors, risks, recommendations, encouragement) MUST be written in ${lang}.` },
        { role: "user", content: `Crop: ${data.crop}\nArea: ${data.areaHectares} ha\nSoil: ${data.soilType}\nRainfall: ${data.rainfallMm} mm\nSeason: ${data.season}\nRegion: ${data.region ?? "n/a"}\nNotes: ${data.notes ?? "none"}\nProvide a careful estimate and 4-6 actionable improvements.` },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "report_yield" } },
    });

    const args = ai.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("Could not estimate yield. Please try again.");
    const result = JSON.parse(args);

    await supabase.from("analyses").insert({
      user_id: userId,
      type: "yield",
      title: `${data.crop} — ${result.estimatedYieldTonnes}t est.`,
      result,
      input_summary: data,
    });

    return result;
  });

// ---------- Chat (empathetic farmer assistant) ----------
export const chatWithAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { conversationId: string; message: string; language?: string }) =>
    z.object({
      conversationId: z.string().uuid(),
      message: z.string().min(1).max(2000),
      language: z.string().max(40).optional(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const lang = data.language || "English";

    await supabase.from("chat_messages").insert({
      user_id: userId, conversation_id: data.conversationId, role: "user", content: data.message,
    });

    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", userId)
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true })
      .limit(40);

    const ai = await callAI({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: `You are AgriVision AI — a kind, encouraging farming companion. Speak simply. Acknowledge that harvesting is hard work; many farmers struggle with weather, pests, market prices, and exhaustion. Validate their feelings, then give practical, low-cost guidance. Use short paragraphs and bullet points when helpful. ALWAYS reply in ${lang}.` },
        ...(history ?? []).map(m => ({ role: m.role, content: m.content })),
      ],
    });

    const reply = ai.choices?.[0]?.message?.content ?? "I'm here for you. Could you tell me a bit more?";
    await supabase.from("chat_messages").insert({
      user_id: userId, conversation_id: data.conversationId, role: "assistant", content: reply,
    });
    return { reply };
  });

// ---------- History ----------
export const getHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("analyses").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(50);
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const getChatHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { conversationId: string }) =>
    z.object({ conversationId: z.string().uuid() }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: msgs } = await supabase.from("chat_messages")
      .select("id, role, content, created_at")
      .eq("user_id", userId).eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true });
    return { messages: msgs ?? [] };
  });
