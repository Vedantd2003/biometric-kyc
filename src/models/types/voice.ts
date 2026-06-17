export interface VoiceMessage {
  role: "user" | "assistant";
  content: string;
}

export interface VoiceIntent {
  say: string;
  action?: {
    type: "navigate" | "trigger";
    to?: string;
    target?: string;
  };
}

export interface SttResponse {
  transcript: string;
}

export interface TtsResponse {
  audioBase64: string;
}
