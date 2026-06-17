import { Functions } from "appwrite";
import client from "@/lib/appwrite";

const functions = new Functions(client);

export const faceAuthService = {
  async enroll(userId: string, imageBase64: string): Promise<{ success: boolean; faceTemplateRef?: string; error?: string }> {
    const result = await functions.createExecution(
      "hv-enroll",
      JSON.stringify({ userId, imageBase64 }),
      false
    );
    if (result.responseStatusCode !== 200) {
      throw new Error(`Enroll function failed: ${result.responseStatusCode}`);
    }
    return JSON.parse(result.responseBody);
  },

  async authenticate(userId: string, imageBase64: string, faceTemplateRef: string): Promise<{ success: boolean; matchScore?: number; error?: string }> {
    const result = await functions.createExecution(
      "hv-authenticate",
      JSON.stringify({ userId, imageBase64, faceTemplateRef }),
      false
    );
    return JSON.parse(result.responseBody);
  },
};
