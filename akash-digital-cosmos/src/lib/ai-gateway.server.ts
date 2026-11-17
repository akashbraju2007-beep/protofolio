import { createOpenAI } from "@ai-sdk/openai";

const RUN_ID_HEADER = "X-AI-Gateway-Run-ID";
const LEGACY_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function createPortfolioAI(apiKey: string, initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  let resolveRunId: (value: string | undefined) => void = () => {};
  let resolved = false;
  const ready = new Promise<string | undefined>((resolve) => {
    resolveRunId = resolve;
  });

  const publish = (value?: string) => {
    const next = value?.trim() || undefined;
    if (!runId && next) runId = next;
    if (!resolved) {
      resolved = true;
      resolveRunId(runId);
    }
  };
  if (runId) publish(runId);

  const baseURL = process.env["AI_GATEWAY_URL"] || "https://ai.gateway.lovable.dev/v1";

  const provider = createOpenAI({
    baseURL,
    apiKey,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Lovable-API-Key": apiKey,
    },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) {
        headers.set(RUN_ID_HEADER, runId);
        headers.set(LEGACY_RUN_ID_HEADER, runId);
      }
      try {
        const response = await fetch(input, { ...init, headers });
        publish(
          response.headers.get(RUN_ID_HEADER) ??
            response.headers.get(LEGACY_RUN_ID_HEADER) ??
            undefined,
        );
        return response;
      } catch (error) {
        publish();
        throw error;
      }
    },
  });

  return {
    model: provider.responses("openai/gpt-6-astra"),
    getRunId: () => runId,
    waitForRunId: () => (runId ? Promise.resolve(runId) : ready),
  };
}

export function incomingRunId(request: Request) {
  return request.headers.get(RUN_ID_HEADER)?.trim() || undefined;
}

export async function attachRunId(
  response: Response,
  gateway: { getRunId: () => string | undefined; waitForRunId: () => Promise<string | undefined> },
) {
  if (!response.body) return response;
  const reader = response.body.getReader();
  const firstChunk = reader.read();
  const runId = await gateway.waitForRunId();
  const headers = new Headers(response.headers);
  if (runId) headers.set(RUN_ID_HEADER, runId);
  headers.set("Access-Control-Expose-Headers", RUN_ID_HEADER);

  const body = new ReadableStream({
    async start(controller) {
      try {
        const first = await firstChunk;
        if (!first.done) controller.enqueue(first.value);
        while (!first.done) {
          const chunk = await reader.read();
          if (chunk.done) break;
          controller.enqueue(chunk.value);
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
}
