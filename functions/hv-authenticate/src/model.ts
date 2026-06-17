export interface AuthenticateRequest {
  userId: string;
  imageBase64: string;
  faceTemplateRef: string;
}

export interface AuthenticateResponse {
  success: boolean;
  matchScore?: number;
  error?: string;
}
