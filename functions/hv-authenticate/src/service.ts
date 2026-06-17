const HV_BASE = "https://ind.hyperverge.co/v1";

export async function matchFace(
  imageBase64: string,
  personId: string,
  appId: string,
  appKey: string
): Promise<{ matched: boolean; score: number }> {
  const res = await fetch(`${HV_BASE}/person/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      appid: appId,
      appkey: appKey,
    },
    body: JSON.stringify({
      image: { base64: imageBase64 },
      personId,
    }),
  });
  if (!res.ok) {
    throw new Error(`HyperVerge face match failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { result?: { match?: boolean; score?: number } };
  return {
    matched: data?.result?.match ?? false,
    score: data?.result?.score ?? 0,
  };
}

export async function checkLiveness(imageBase64: string, appId: string, appKey: string): Promise<boolean> {
  const res = await fetch(`${HV_BASE}/checkLiveness`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      appid: appId,
      appkey: appKey,
    },
    body: JSON.stringify({ image: { base64: imageBase64 } }),
  });
  if (!res.ok) throw new Error(`Liveness failed: ${res.status}`);
  const data = (await res.json()) as { result?: { live?: boolean; livenessScore?: number } };
  return (data?.result?.live ?? false) && (data?.result?.livenessScore ?? 0) >= 0.7;
}
