import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

/**
 * Translate a flat dictionary of English UI strings to the target language.
 * Returns an object with the same keys.
 */
export const translateUI = createServerFn({ method: "POST" })
  .inputValidator((d: { language: string; keys: Record<string, string> }) =>
    z.object({
      language: z.string().min(1).max(40),
      keys: z.record(z.string().min(1).max(60), z.string().min(1).max(200)),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    if (!data.language || data.language.toLowerCase() === "english") {
      return { translations: data.keys };
    }
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI gateway not configured");

    const tools = [{
      type: "function",
      function: {
        name: "return_translations",
        description: `Return the translations object`,
        parameters: {
          type: "object",
          properties: {
            translations: {
              type: "object",
              description: `An object with the same keys as the input, with values translated to ${data.language}.`,
              additionalProperties: { type: "string" },
            },
          },
          required: ["translations"],
          additionalProperties: false,
        },
      },
    }];

    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: `You translate short UI labels for a farming app into ${data.language}. Keep translations very short, natural, and friendly to farmers. Preserve every key exactly. Do not translate brand names like 'AgriVision AI'.` },
          { role: "user", content: `Translate these UI strings to ${data.language}. Return JSON via the function.\n\n${JSON.stringify(data.keys)}` },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "return_translations" } },
      }),
    });
    if (!res.ok) {
      // Soft-fail to English — UI shouldn't break.
      return { translations: data.keys };
    }
    const j = await res.json();
    const args = j.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return { translations: data.keys };
    try {
      const parsed = JSON.parse(args);
      return { translations: parsed.translations as Record<string, string> };
    } catch {
      return { translations: data.keys };
    }
  });
