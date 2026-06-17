"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { HandResult } from "@/models/types/hand";
import { classifyGesture, countRaisedFingers } from "@/models/types/gestureClassifier";

export function useHandTrackingController() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hands, setHands] = useState<HandResult[]>([]);
  const [fps, setFps] = useState(0);
  const [ready, setReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const handLandmarkerRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const fpsTimeRef = useRef(0);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError("Camera access denied. Please allow camera permission and refresh.");
    }
  }, []);

  const initHandLandmarker = useCallback(async () => {
    const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    const landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    handLandmarkerRef.current = landmarker;
    setReady(true);
  }, []);

  const detect = useCallback(() => {
    const video = videoRef.current;
    const landmarker = handLandmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    const now = performance.now();
    if (now - lastTimeRef.current < 16) { // cap at ~60fps
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    const result = landmarker.detectForVideo(video, now);
    lastTimeRef.current = now;

    // FPS counter
    frameCountRef.current++;
    if (now - fpsTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      fpsTimeRef.current = now;
    }

    const detected: HandResult[] = (result.landmarks ?? []).map((lms: any, i: number) => {
      const hand = result.handednesses?.[i]?.[0];
      return {
        handedness: (hand?.categoryName ?? "Right") as "Left" | "Right",
        confidence: hand?.score ?? 0,
        landmarks: lms,
        gesture: classifyGesture(lms),
        raisedFingers: countRaisedFingers(lms),
      };
    });
    setHands(detected);
    rafRef.current = requestAnimationFrame(detect);
  }, []);

  useEffect(() => {
    let mounted = true;
    startCamera().then(() => {
      if (mounted) initHandLandmarker().then(() => { if (mounted) rafRef.current = requestAnimationFrame(detect); });
    });
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      handLandmarkerRef.current?.close?.();
    };
  }, [startCamera, initHandLandmarker, detect]);

  return { videoRef, hands, fps, ready, cameraError };
}
