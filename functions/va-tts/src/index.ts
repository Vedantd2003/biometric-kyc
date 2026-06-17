// va-tts: Text-to-speech using Sarvam Bulbul v3
const SARVAM_BASE = "https://api.sarvam.ai";

export default async ({ req, res, log, error }: { req: any; res: any; log: any; error: any }) => {
  try {
    const body = JSON.parse(req.body ?? "{}") as { text: string; speaker?: string };
    if (!body.text) return res.json({ error: "Missing text" }, 400);

    const apiKey = process.env.SARVAM_API_KEY!;

    const ttsRes = await fetch(`${SARVAM_BASE}/v1/text-to-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        inputs: [body.text.slice(0, 2500)],
        target_language_code: "en-IN",
        speaker: body.speaker ?? "meera",
        model: "bulbul:v3",
        enable_preprocessing: true,
      }),
    });

    if (!ttsRes.ok) throw new Error(`Sarvam TTS error: ${ttsRes.status} ${await ttsRes.text()}`);

    const data = (await ttsRes.json()) as { audios?: string[] };
    const audioBase64 = data?.audios?.[0] ?? "";
    return res.json({ audioBase64 });
  } catch (err: unknown) {
    error(String(err));
    return res.json({ error: "TTS failed" }, 500);
  }
};
