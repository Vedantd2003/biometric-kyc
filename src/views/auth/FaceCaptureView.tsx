"use client";

import { useEffect } from "react";
import { useFaceAuthController } from "@/controllers/useFaceAuthController";
import { Button } from "@/views/components/Button";

interface FaceCaptureViewProps {
  mode: "enroll" | "authenticate";
  onSuccess?: () => void;
  onFailure?: () => void;
}

export function FaceCaptureView({ mode, onSuccess, onFailure }: FaceCaptureViewProps) {
  const { videoRef, canvasRef, streaming, loading, error, result, retries, startCamera, enroll, authenticate } = useFaceAuthController();

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (result === "success") onSuccess?.();
    if (result === "failed" && retries >= 3) onFailure?.();
  }, [result, retries, onSuccess, onFailure]);

  const handleCapture = mode === "enroll" ? enroll : authenticate;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-600 bg-black">
        <video ref={videoRef} className="h-64 w-64 object-cover [transform:scaleX(-1)]" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        {/* oval overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-48 w-40 rounded-full border-4 border-white/50" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {result === "success" && (
        <p className="text-sm font-medium text-green-600">{mode === "enroll" ? "Face enrolled successfully!" : "Identity verified!"}</p>
      )}

      <p className="text-xs text-zinc-500">Position your face inside the oval and ensure good lighting.</p>

      <Button onClick={handleCapture} loading={loading} disabled={!streaming || result === "success"}>
        {mode === "enroll" ? "Enroll face" : `Verify (attempt ${retries + 1}/3)`}
      </Button>
    </div>
  );
}
