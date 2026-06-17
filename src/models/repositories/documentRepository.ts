import { databases, storage } from "@/lib/appwrite";
import { config } from "@/lib/config";
import { ID, Query } from "appwrite";
import type { DocumentRecord, OcrResult, VerificationStatus } from "@/models/types";

const { databaseId, documentsCollectionId, storageBucketId } = config.appwrite;

export const documentRepository = {
  async uploadFile(file: File): Promise<string> {
    const res = await storage.createFile(storageBucketId, ID.unique(), file);
    return res.$id;
  },

  async create(userId: string, fileId: string, docType: string): Promise<DocumentRecord> {
    return databases.createDocument(databaseId, documentsCollectionId, ID.unique(), {
      userId,
      fileId,
      docType,
      ocrResult: null,
      verificationStatus: "pending" as VerificationStatus,
      createdAt: new Date().toISOString(),
    }) as unknown as DocumentRecord;
  },

  async update(docId: string, data: { ocrResult?: OcrResult; verificationStatus?: VerificationStatus }): Promise<DocumentRecord> {
    const payload: Record<string, unknown> = {};
    if (data.ocrResult) payload.ocrResult = JSON.stringify(data.ocrResult);
    if (data.verificationStatus) payload.verificationStatus = data.verificationStatus;
    return databases.updateDocument(databaseId, documentsCollectionId, docId, payload) as unknown as DocumentRecord;
  },

  async listByUser(userId: string): Promise<DocumentRecord[]> {
    const res = await databases.listDocuments(databaseId, documentsCollectionId, [
      Query.equal("userId", userId),
      Query.orderDesc("createdAt"),
    ]);
    return res.documents as unknown as DocumentRecord[];
  },

  getFilePreviewUrl(fileId: string): string {
    return storage.getFilePreview(storageBucketId, fileId).toString();
  },
};
