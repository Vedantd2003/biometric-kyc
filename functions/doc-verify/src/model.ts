export interface DocVerifyRequest {
  fileBase64: string;
  mimeType: string;
  docType: string;
  userName: string;
}

export interface DocVerifyResponse {
  success: boolean;
  ocrResult?: {
    rawText: string;
    fields: Record<string, string>;
    confidence: number;
  };
  verificationStatus?: "verified" | "failed";
  failureReason?: string;
  error?: string;
}
