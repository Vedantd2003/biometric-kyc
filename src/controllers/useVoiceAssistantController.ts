"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { voiceService } from "@/services/voiceService";
import type { VoiceMessage } from "@/models/types";

const MAX_HISTORY = 10;

export function useVoiceAssistantController(kycStatus = "pending") {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [history, setHistory] = useState<VoiceMessage[]>([]);
  const [transcript, setTranscript] = useState("");
  const [lastReply, setLastReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const PAGE_ACTIONS: Record<string, string[]> = {
    "/dashboard": ["view KYC status", "navigate to document verification", "open hand control"],
    "/login": ["login with email and password"],
    "/signup": ["create a new account"],
    "/verify-document": ["upload identity document", "select document type"],
    "/hand-control": ["view hand tracking", "see gesture controls"],
  };

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunks.current = [];
      recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
      recorder.start();
      mediaRecorder.current = recorder;
      setRecording(true);
    } catch {
      setError("Microphone access denied.");
    }
  }, []);

  const stopRecordingAndProcess = useCallback(async () => {
    const recorder = mediaRecorder.current;
    if (!recorder) return;

    setRecording(false);
    setThinking(true);

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
      recorder.stream.getTracks().forEach((t) => t.stop());
    });

    try {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      const arrayBuffer = await blob.arrayBuffer();
      const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const { transcript: text } = await voiceService.transcribe(audioBase64, "audio/webm");
      setTranscript(text);

      const context = {
        route: pathname,
        kycStatus,
        availableActions: PAGE_ACTIONS[pathname] ?? ["navigate to dashboard"],
      };

      const intent = await voiceService.think(text, history.slice(-MAX_HISTORY), context);
      setLastReply(intent.say);
      setHistory((h) => [...h, { role: "user", content: text }, { role: "assistant", content: intent.say }]);

      if (intent.action?.type === "navigate" && intent.action.to) {
        router.push(intent.action.to);
      }

      setThinking(false);
      setSpeaking(true);
      const { audioBase64: ttsAudio } = await voiceService.speak(intent.say);
      voiceService.playAudio(ttsAudio);
      setSpeaking(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Voice processing failed");
      setThinking(false);
      setSpeaking(false);
    }
  }, [pathname, kycStatus, history, router]);

  return {
    open, setOpen,
    recording, thinking, speaking,
    transcript, lastReply, history, error,
    startRecording, stopRecordingAndProcess,
  };
}
