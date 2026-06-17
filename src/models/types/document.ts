export type VerificationStatus = "pending" | "verified" | "failed";

export interface DocumentRecord {
  $id: string;
  userId: string;
  fileId: string;
  docType: string;
  ocrResult: OcrResult | null;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface OcrResult {
  rawText: string;
  fields: Record<string, string>;
  confidence: number;
}

export interface DocVerifyResponse {
  success: boolean;
  ocrResult?: OcrResult;
  verificationStatus?: "verified" | "failed";
  failureReason?: string;
  error?: string;
}
