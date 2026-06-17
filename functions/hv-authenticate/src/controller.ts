import { checkLiveness, matchFace } from "./service";
import type { AuthenticateRequest, AuthenticateResponse } from "./model";

const MATCH_THRESHOLD = 0.75;

export async function handleAuthenticate(req: AuthenticateRequest): Promise<AuthenticateResponse> {
  const { imageBase64, faceTemplateRef } = req;
  const appId = process.env.HYPERVERGE_APP_ID!;
  const appKey = process.env.HYPERVERGE_APP_KEY!;

  const isLive = await checkLiveness(imageBase64, appId, appKey);
  if (!isLive) {
    return { success: false, error: "Liveness check failed. Please try again in good lighting." };
  }

  const { matched, score } = await matchFace(imageBase64, faceTemplateRef, appId, appKey);

  if (!matched || score < MATCH_THRESHOLD) {
    return { success: false, matchScore: score, error: "Face does not match enrolled photo." };
  }

  return { success: true, matchScore: score };
}
