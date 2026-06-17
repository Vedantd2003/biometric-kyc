import type { Landmark, GestureName } from "./hand";
import { FINGERTIP_IDS, FINGER_MID_IDS } from "./hand";

export function countRaisedFingers(landmarks: Landmark[]): number {
  let count = 0;
  // Thumb: tip (4) x vs base (2) x — mirrored (selfie view)
  if (landmarks[4].x < landmarks[3].x) count++;
  // Other 4 fingers: tip y < mid y means raised
  for (let i = 1; i < 5; i++) {
    if (landmarks[FINGERTIP_IDS[i]].y < landmarks[FINGER_MID_IDS[i]].y) count++;
  }
  return count;
}

export function classifyGesture(landmarks: Landmark[]): GestureName {
  const raised = countRaisedFingers(landmarks);
  const thumbUp = landmarks[4].x < landmarks[3].x;
  const indexUp = landmarks[8].y < landmarks[7].y;
  const middleUp = landmarks[12].y < landmarks[11].y;
  const ringUp = landmarks[16].y < landmarks[15].y;
  const pinkyUp = landmarks[20].y < landmarks[19].y;

  if (raised === 0) return "fist";
  if (raised === 5) return "open_palm";
  if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) return "thumbs_up";
  if (!thumbUp && indexUp && !middleUp && !ringUp && !pinkyUp) return "point";
  if (!thumbUp && indexUp && middleUp && !ringUp && !pinkyUp) return "peace";

  // OK: thumb + index tip close together
  const dx = landmarks[4].x - landmarks[8].x;
  const dy = landmarks[4].y - landmarks[8].y;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.06 && middleUp && ringUp && pinkyUp) return "ok";

  return "unknown";
}
