export type Handedness = "Left" | "Right";

export type GestureName =
  | "fist"
  | "open_palm"
  | "point"
  | "peace"
  | "thumbs_up"
  | "ok"
  | "unknown";

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandResult {
  handedness: Handedness;
  confidence: number;
  landmarks: Landmark[];
  gesture: GestureName;
  raisedFingers: number;
}

// Landmark indices per MediaPipe Hand Landmarker
export const FINGERTIP_IDS = [4, 8, 12, 16, 20] as const;
export const FINGER_BASE_IDS = [2, 6, 10, 14, 18] as const;
export const FINGER_MID_IDS = [3, 7, 11, 15, 19] as const;

export const HAND_CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17],
];
