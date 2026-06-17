import { Functions } from "appwrite";
import client from "@/lib/appwrite";
import type { VoiceMessage, VoiceIntent, SttResponse, TtsResponse } from "@/models/types";

const functions = new Functions(client);

export const voiceService = {
  async transcribe(audioBase64: string, mimeType: string): Promise<SttResponse> {
    const result = await functions.createExecution(
      "va-stt",
      JSON.stringify({ audioBase64, mimeType }),
      false
    );
    return JSON.parse(result.responseBody) as SttResponse;
  },

  async think(
    userMessage: string,
    history: VoiceMessage[],
    context: { route: string; kycStatus: string; availableActions: string[] }
  ): Promise<VoiceIntent> {
    const result = await functions.createExecution(
      "va-brain",
      JSON.stringify({ userMessage, history, context }),
      false
    );
    return JSON.parse(result.responseBody) as VoiceIntent;
  },

  async speak(text: string): Promise<TtsResponse> {
    const result = await functions.createExecution(
      "va-tts",
      JSON.stringify({ text }),
      false
    );
    return JSON.parse(result.responseBody) as TtsResponse;
  },

  playAudio(audioBase64: string): void {
    const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
    audio.play().catch(() => {/* autoplay blocked — user must interact first */});
  },
};
