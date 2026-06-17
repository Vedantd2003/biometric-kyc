// va-brain: LLM reasoning via OpenRouter, returns spoken reply + optional navigation intent
const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

interface Message { role: "system" | "user" | "assistant"; content: string; }
interface BrainRequest {
  userMessage: string;
  history: { role: "user" | "assistant"; content: string }[];
  context: { route: string; kycStatus: string; availableActions: string[] };
}

const SYSTEM_PROMPT = (ctx: BrainRequest["context"]) => `You are a helpful onboarding voice assistant for a biometric KYC web application.
Current page: ${ctx.route}
User KYC status: ${ctx.kycStatus}
Available actions on this page: ${ctx.availableActions.join(", ")}

Your job: guide users through signup, face enrollment, and document verification so they never get stuck.
Always respond with valid JSON in this exact shape:
{"say": "<spoken reply under 80 words>", "action": null}
OR if you should navigate/trigger something:
{"say": "<spoken reply>", "action": {"type": "navigate", "to": "/path"}}
OR:
{"say": "<spoken reply>", "action": {"type": "trigger", "target": "action-name"}}

Keep replies concise, friendly, and actionable.`;

export default async ({ req, res, log, error }: { req: any; res: any; log: any; error: any }) => {
  try {
    const body: BrainRequest = JSON.parse(req.body ?? "{}");
    if (!body.userMessage || !body.context) return res.json({ error: "Missing fields" }, 400);

    const apiKey = process.env.OPENROUTER_API_KEY!;

    const messages: Message[] = [
      { role: "system", content: SYSTEM_PROMPT(body.context) },
      ...body.history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: body.userMessage },
    ];

    const llmRes = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://biometric-kyc.app",
        "X-Title": "Biometric KYC Assistant",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages,
        response_format: { type: "json_object" },
        max_tokens: 300,
        temperature: 0.5,
      }),
    });

    if (!llmRes.ok) throw new Error(`OpenRouter error: ${llmRes.status} ${await llmRes.text()}`);

    const llmData = (await llmRes.json()) as { choices?: { message?: { content?: string } }[] };
    const content = llmData?.choices?.[0]?.message?.content ?? '{"say":"I\'m sorry, I couldn\'t understand that. Could you try again?","action":null}';

    const intent = JSON.parse(content) as { say: string; action?: { type: string; to?: string; target?: string } | null };
    return res.json(intent);
  } catch (err: unknown) {
    error(String(err));
    return res.json({ say: "I'm having trouble right now. Please try again.", action: null }, 500);
  }
};
