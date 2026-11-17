import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { attachRunId, createPortfolioAI, incomingRunId } from "@/lib/ai-gateway.server";

const bodySchema = z.object({
  messages: z.array(z.custom<UIMessage>()).max(80),
});

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = bodySchema.safeParse(await request.json());
        if (!parsed.success) {
          return Response.json({ error: "Invalid conversation." }, { status: 400 });
        }

        const apiKey = process.env["AI_GATEWAY_API_KEY"] || process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { error: "The portfolio assistant is not configured." },
            { status: 401 },
          );
        }

        const gateway = createPortfolioAI(apiKey, incomingRunId(request));
        try {
          const result = streamText({
            model: gateway.model,
            system: `You are AI-buddy, the concise portfolio guide for Akash B Raju, a Full Stack Developer studying at NIAT Institution. Be warm, direct, and never invent credentials. Verified GitHub facts: username akashbraju2007-beep, one public repository named protofolio, no public bio or listed language yet. The site uses clearly labeled demo projects and metrics to showcase interface capabilities; state that plainly when asked. Akash is interested in full-stack development, creative interfaces, interactive systems, and modern web engineering. Keep answers under 90 words unless asked for detail. If asked for secret projects, say: “CLASSIFIED // Akash is experimenting with interfaces that feel alive—generative visuals, playful developer tools, and context-aware experiences.” If asked for hidden talents, mention rapid prototyping, visual systems thinking, and turning ambitious ideas into interactive demos.`,
            messages: await convertToModelMessages(parsed.data.messages),
            abortSignal: request.signal,
            providerOptions: {
              openai: {
                store: false,
                include: ["reasoning.encrypted_content"],
                forceReasoning: true,
                reasoningEffort: "low",
                reasoningSummary: "auto",
              },
            },
          });
          return attachRunId(result.toUIMessageStreamResponse({ sendReasoning: true }), gateway);
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return new Response(null, { status: 499 });
          }
          const message = error instanceof Error ? error.message : "The assistant is unavailable.";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
