// va-stt: Speech-to-text using Sarvam Saaras v3
const SARVAM_BASE = "https://api.sarvam.ai";

export default async ({ req, res, log, error }: { req: any; res: any; log: any; error: any }) => {
  try {
    const body = JSON.parse(req.body ?? "{}") as { audioBase64: string; mimeType?: string };
    if (!body.audioBase64) return res.json({ error: "Missing audioBase64" }, 400);

    const apiKey = process.env.SARVAM_API_KEY!;

    // Sarvam STT: POST /v1/speech-to-text-translate or /v1/speech-to-text
    const audioBuffer = Buffer.from(body.audioBase64, "base64");
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: body.mimeType ?? "audio/webm" });
    formData.append("file", blob, "audio.webm");
    formData.append("model", "saaras:v3");
    formData.append("mode", "transcribe");
    formData.append("language_code", "en-IN");

    const sttRes = await fetch(`${SARVAM_BASE}/v1/speech-to-text`, {
      method: "POST",
      headers: { "api-subscription-key": apiKey },
      body: formData,
    });

    if (!sttRes.ok) throw new Error(`Sarvam STT error: ${sttRes.status} ${await sttRes.text()}`);

    const data = (await sttRes.json()) as { transcript?: string };
    return res.json({ transcript: data.transcript ?? "" });
  } catch (err: unknown) {
    error(String(err));
    return res.json({ error: "STT failed" }, 500);
  }
};
