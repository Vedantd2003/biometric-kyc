"use client";

import { useVoiceAssistantController } from "@/controllers/useVoiceAssistantController";
import { cn } from "@/lib/utils";

interface Props { kycStatus?: string; }

export function VoiceAssistantWidget({ kycStatus = "pending" }: Props) {
  const {
    open, setOpen,
    recording, thinking, speaking,
    transcript, lastReply, error,
    startRecording, stopRecordingAndProcess,
  } = useVoiceAssistantController(kycStatus);

  const statusLabel = recording ? "Listening…" : thinking ? "Thinking…" : speaking ? "Speaking…" : "Ask me anything";

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
          open ? "bg-zinc-800 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700",
          (recording || speaking) && "ring-4 ring-indigo-400/50 animate-pulse"
        )}
        aria-label="Toggle voice assistant"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="bg-indigo-600 px-4 py-3">
            <p className="text-sm font-semibold text-white">AI Assistant</p>
            <p className="text-xs text-indigo-200">{statusLabel}</p>
          </div>

          <div className="flex flex-col gap-3 p-4">
            {error && <p className="text-xs text-red-600">{error}</p>}

            {transcript && (
              <div className="rounded-xl bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800">
                <span className="text-xs font-medium text-zinc-400 block mb-0.5">You said</span>
                {transcript}
              </div>
            )}

            {lastReply && (
              <div className="rounded-xl bg-indigo-50 px-3 py-2 text-sm dark:bg-indigo-900/20">
                <span className="text-xs font-medium text-indigo-400 block mb-0.5">Assistant</span>
                {lastReply}
              </div>
            )}

            {!lastReply && !transcript && (
              <p className="text-xs text-zinc-400 text-center py-2">
                Hold the mic button and ask me how to get started, how to verify your document, or anything else.
              </p>
            )}

            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecordingAndProcess}
              onTouchStart={startRecording}
              onTouchEnd={stopRecordingAndProcess}
              disabled={thinking || speaking}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition",
                recording
                  ? "bg-red-600 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              )}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm6.364 9a1 1 0 012 0 8 8 0 01-15.728 2.121 1 1 0 011.82-.822A6 6 0 0018 10zm-6 10a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1z" />
              </svg>
              {recording ? "Release to send" : thinking ? "Thinking…" : "Hold to speak"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
