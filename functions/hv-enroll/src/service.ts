import type { HvLivenessResult } from "./model";

const HV_BASE = "https://ind.hyperverge.co/v1";

export async function checkLiveness(imageBase64: string, appId: string, appKey: string): Promise<HvLivenessResult> {
  const res = await fetch(`${HV_BASE}/checkLiveness`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      appid: appId,
      appkey: appKey,
    },
    body: JSON.stringify({ image: { base64: imageBase64 } }),
  });
  if (!res.ok) {
    throw new Error(`HyperVerge liveness check failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<HvLivenessResult>;
}

export async function enrollFace(imageBase64: string, userId: string, appId: string, appKey: string): Promise<string> {
  // HyperVerge face enroll — creates a person and returns a personId / faceId to store
  const res = await fetch(`${HV_BASE}/person/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      appid: appId,
      appkey: appKey,
    },
    body: JSON.stringify({
      image: { base64: imageBase64 },
      externalId: userId,
    }),
  });
  if (!res.ok) {
    throw new Error(`HyperVerge enroll failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { result?: { personId?: string }; personId?: string };
  const personId = data?.result?.personId ?? data?.personId;
  if (!personId) throw new Error("No personId returned from HyperVerge enroll");
  return personId;
}
