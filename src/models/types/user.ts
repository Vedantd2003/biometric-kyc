export type KycStatus = "pending" | "verified" | "failed";

export interface UserProfile {
  $id: string;
  userId: string;
  faceEnrolled: boolean;
  faceTemplateRef: string | null;
  kycStatus: KycStatus;
  createdAt: string;
}

export interface AppwriteUser {
  $id: string;
  email: string;
  name: string;
}
