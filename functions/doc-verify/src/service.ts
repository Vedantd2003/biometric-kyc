const SARVAM_BASE = "https://api.sarvam.ai";

export interface SarvamDocResult {
  text: string;
  fields: Record<string, string>;
  confidence: number;
}

export async function extractDocument(fileBase64: string, mimeType: string, apiKey: string): Promise<SarvamDocResult> {
  const res = await fetch(`${SARVAM_BASE}/v1/vision/document-intelligence`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": apiKey,
    },
    body: JSON.stringify({
      image: { base64: fileBase64, mimeType },
    }),
  });

  if (!res.ok) {
    throw new Error(`Sarvam Vision failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    text?: string;
    fields?: Record<string, string>;
    confidence?: number;
  };

  return {
    text: data.text ?? "",
    fields: data.fields ?? {},
    confidence: data.confidence ?? 0,
  };
}
