export interface EnrollRequest {
  userId: string;
  imageBase64: string;
}

export interface EnrollResponse {
  success: boolean;
  faceTemplateRef?: string;
  livenessScore?: number;
  error?: string;
}

export interface HvLivenessResult {
  status: string;
  result?: {
    live: boolean;
    livenessScore: number;
    faceId?: string;
  };
  error?: string;
}
