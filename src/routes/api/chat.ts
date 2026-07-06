import { createFileRoute } from "@tanstack/react-router";
import { callGateway, type ChatMessage } from "@/lib/ai-gateway.server";
import { dishes, restaurants } from "@/lib/data";

type Body = {
  messages?: Array<{ role: string; content: string }>;
  imageDataUrl?: string;
};

const SYSTEM = `You are Bites AI, a warm and concise food-delivery assistant on an Indian food app.
You help users pick meals, find restaurants, understand nutrition, plan combos, and answer
diet/calorie questions. Prices are in Indian Rupees (₹).

You may reference this small in-app catalog when helpful:
${dishes
  .map(
    (d) =>
      `- ${d.name} (${d.category}, ${d.veg ? "veg" : "non-veg"}, ₹${d.price}) at ${d.restaurantName}`,
  )
  .join("\n")}

Restaurants: ${restaurants.map((r) => r.name).join(", ")}.

Keep replies under 120 words unless the user asks for detail. Use short paragraphs and
bullet lists. When suggesting dishes, mention approximate calories if relevant.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const history = Array.isArray(body.messages) ? body.messages : [];
        if (history.length === 0) {
          return new Response("messages required", { status: 400 });
        }

        const msgs: ChatMessage[] = [{ role: "system", content: SYSTEM }];
        for (let i = 0; i < history.length; i++) {
          const m = history[i];
          const isLast = i === history.length - 1;
          if (
            isLast &&
            m.role === "user" &&
            body.imageDataUrl &&
            body.imageDataUrl.startsWith("data:image/")
          ) {
            msgs.push({
              role: "user",
              content: [
                {
                  type: "text",
                  text:
                    (m.content || "") +
                    "\n\nAnalyze the attached food image. Identify the dish, estimate calories per serving, list likely ingredients, note if it looks healthy, and suggest 1-2 similar items from our catalog.",
                },
                { type: "image_url", image_url: { url: body.imageDataUrl } },
              ],
            });
          } else if (m.role === "user" || m.role === "assistant") {
            msgs.push({ role: m.role, content: String(m.content ?? "") });
          }
        }

        try {
          const { text } = await callGateway({ messages: msgs });
          return Response.json({ text });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "AI error";
          const status = msg.includes("429") ? 429 : msg.includes("402") ? 402 : 500;
          return Response.json({ error: msg }, { status });
        }
      },
    },
  },
});
