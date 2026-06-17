"use client";

import dynamic from "next/dynamic";

const VoiceAssistantWidget = dynamic(
  () => import("./VoiceAssistantWidget").then((m) => m.VoiceAssistantWidget),
  { ssr: false }
);

export function VoiceAssistantLoader() {
  return <VoiceAssistantWidget />;
}
