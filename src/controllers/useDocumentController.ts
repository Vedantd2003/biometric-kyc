"use client";

import { useState, useCallback } from "react";
import { account } from "@/lib/appwrite";
import { documentRepository } from "@/models/repositories/documentRepository";
import { documentService } from "@/services/documentService";
import { userRepository } from "@/models/repositories/userRepository";
import type { DocumentRecord } from "@/models/types";

export function useDocumentController() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<DocumentRecord | null>(null);

  const submit = useCallback(async (file: File, docType: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await account.get();
      // Upload raw file to Appwrite Storage
      const fileId = await documentRepository.uploadFile(file);
      // Create DB record
      const docRecord = await documentRepository.create(u.$id, fileId, docType);
      // Get user's name for name-match verification
      const profile = await userRepository.getByUserId(u.$id);
      const userName = u.name ?? "";
      // Call Appwrite Function → Sarvam Vision
      const verifyResult = await documentService.verify(file, docType, userName);
      if (!verifyResult.success) throw new Error(verifyResult.error ?? "Verification service error");
      // Persist OCR result + status
      const updated = await documentRepository.update(docRecord.$id, {
        ocrResult: verifyResult.ocrResult,
        verificationStatus: verifyResult.verificationStatus ?? "failed",
      });
      // Update user KYC status
      if (profile) {
        await userRepository.update(profile.$id, {
          kycStatus: verifyResult.verificationStatus === "verified" ? "verified" : "failed",
        });
      }
      setDocument(updated);
      return updated;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Document verification failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, document, submit };
}
