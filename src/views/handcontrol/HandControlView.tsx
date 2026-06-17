"use client";

import { useHandTrackingController } from "@/controllers/useHandTrackingController";
import { HandCanvasOverlay } from "./HandCanvasOverlay";
import { cn } from "@/lib/utils";
import type { GestureName } from "@/models/types/hand";

const GESTURE_EMOJI: Record<GestureName, string> = {
  fist: "✊",
  open_palm: "🖐",
  point: "👆",
  peace: "✌️",
  thumbs_up: "👍",
  ok: "👌",
  unknown: "❓",
};

const GESTURE_ACTION: Record<GestureName, string> = {
  fist: "Closed — pause",
  open_palm: "Open palm — stop/pause",
  point: "Pointing — move cursor",
  peace: "Peace — scroll",
  thumbs_up: "Thumbs up — confirm",
  ok: "OK — click/select",
  unknown: "Unrecognized",
};

export function HandControlView() {
  const { videoRef, hands, fps, ready, cameraError } = useHandTrackingController();
  const VIDEO_W = 1280;
  const VIDEO_H = 720;

  if (cameraError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-center px-4">
        <div>
          <p className="text-4xl mb-4">📷</p>
          <p className="text-white text-lg font-semibold">{cameraError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-zinc-950 text-white pt-8 pb-12 px-4 gap-6">
      <div className="flex items-center justify-between w-full max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hand Control</h1>
          <p className="text-sm text-zinc-400">Real-time gesture tracking — 100% on-device</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("h-2 w-2 rounded-full", ready ? "bg-green-400" : "bg-yellow-400 animate-pulse")} />
          <span className="text-xs text-zinc-400">{ready ? "Model ready" : "Loading model…"}</span>
          <span className="text-xs text-zinc-500 ml-2">{fps} FPS</span>
        </div>
      </div>

      {/* Video + canvas */}
      <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-zinc-800 bg-black" style={{ aspectRatio: "16/9" }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover [transform:scaleX(-1)]"
          muted
          playsInline
        />
        <HandCanvasOverlay hands={hands} width={VIDEO_W} height={VIDEO_H} />

        {hands.length === 0 && ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-zinc-500 text-sm">Show your hand to the camera</p>
          </div>
        )}
      </div>

      {/* Per-hand HUD */}
      <div className="grid w-full max-w-5xl gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => {
          const hand = hands[i];
          return (
            <div key={i} className={cn("rounded-2xl border p-4 transition-all", hand ? "border-indigo-700 bg-zinc-900" : "border-zinc-800 bg-zinc-900/50 opacity-40")}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400">Hand {i + 1}</span>
                {hand && <span className="text-xs text-indigo-400">{hand.handedness} · {Math.round(hand.confidence * 100)}%</span>}
              </div>
              {hand ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{GESTURE_EMOJI[hand.gesture]}</span>
                    <div>
                      <p className="font-semibold capitalize">{hand.gesture.replace(/_/g, " ")}</p>
                      <p className="text-xs text-zinc-400">{GESTURE_ACTION[hand.gesture]}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, fi) => (
                      <div key={fi} className={cn("h-6 w-5 rounded-sm text-center text-xs flex items-center justify-center", fi < hand.raisedFingers ? "bg-indigo-600" : "bg-zinc-700")}>
                        {fi + 1}
                      </div>
                    ))}
                    <span className="ml-2 text-xs text-zinc-400 self-center">{hand.raisedFingers} raised</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-zinc-600">No hand detected</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Gesture reference */}
      <div className="w-full max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-300">Gesture reference</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {(Object.entries(GESTURE_EMOJI) as [GestureName, string][])
            .filter(([g]) => g !== "unknown")
            .map(([gesture, emoji]) => (
              <div key={gesture} className="flex flex-col items-center gap-1 rounded-xl bg-zinc-800 p-2 text-center">
                <span className="text-2xl">{emoji}</span>
                <span className="text-[10px] text-zinc-400 capitalize">{gesture.replace(/_/g, " ")}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
