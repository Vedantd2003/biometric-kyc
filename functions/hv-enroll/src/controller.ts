import { checkLiveness, enrollFace } from "./service";
import type { EnrollRequest, EnrollResponse } from "./model";

const LIVENESS_THRESHOLD = 0.7;

export async function handleEnroll(req: EnrollRequest): Promise<EnrollResponse> {
  const { userId, imageBase64 } = req;
  const appId = process.env.HYPERVERGE_APP_ID!;
  const appKey = process.env.HYPERVERGE_APP_KEY!;

  const liveness = await checkLiveness(imageBase64, appId, appKey);

  if (!liveness.result?.live || (liveness.result?.livenessScore ?? 0) < LIVENESS_THRESHOLD) {
    return { success: false, error: "Liveness check failed. Please use a real face in good lighting." };
  }

  const faceTemplateRef = await enrollFace(imageBase64, userId, appId, appKey);

  return {
    success: true,
    faceTemplateRef,
    livenessScore: liveness.result.livenessScore,
  };
}
