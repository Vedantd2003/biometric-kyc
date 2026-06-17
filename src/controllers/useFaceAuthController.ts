"use client";

import { useState, useRef, useCallback } from "react";
import { faceAuthService } from "@/services/faceAuthService";
import { userRepository } from "@/models/repositories/userRepository";
import { account } from "@/lib/appwrite";

const MAX_RETRIES = 3;

export function useFaceAuthController() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<"idle" | "success" | "failed">("idle");
  const [retries, setRetries] = useState(0);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      setError("Camera access denied. Please allow camera permission.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    setStreaming(false);
  }, []);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
  }, []);

  const enroll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const imageBase64 = captureFrame();
      if (!imageBase64) throw new Error("Failed to capture image");
      const u = await account.get();
      const res = await faceAuthService.enroll(u.$id, imageBase64);
      if (!res.success || !res.faceTemplateRef) {
        throw new Error(res.error ?? "Enrollment failed");
      }
      const profile = await userRepository.getByUserId(u.$id);
      if (profile) {
        await userRepository.update(profile.$id, { faceEnrolled: true, faceTemplateRef: res.faceTemplateRef });
      }
      setResult("success");
      stopCamera();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Enrollment failed");
      setResult("failed");
    } finally {
      setLoading(false);
    }
  }, [captureFrame, stopCamera]);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (retries >= MAX_RETRIES) {
      setError("Too many failed attempts. Please contact support.");
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const imageBase64 = captureFrame();
      if (!imageBase64) throw new Error("Failed to capture image");
      const u = await account.get();
      const profile = await userRepository.getByUserId(u.$id);
      if (!profile?.faceTemplateRef) throw new Error("No enrolled face found. Please re-enroll.");
      const res = await faceAuthService.authenticate(u.$id, imageBase64, profile.faceTemplateRef);
      if (!res.success) {
        setRetries((r) => r + 1);
        throw new Error(res.error ?? "Face does not match");
      }
      setResult("success");
      stopCamera();
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setResult("failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, [captureFrame, stopCamera, retries]);

  return { videoRef, canvasRef, streaming, loading, error, result, retries, startCamera, stopCamera, enroll, authenticate };
}
