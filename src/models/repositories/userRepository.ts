import { databases } from "@/lib/appwrite";
import { config } from "@/lib/config";
import { ID, Query } from "appwrite";
import type { UserProfile, KycStatus } from "@/models/types";

const { databaseId, usersCollectionId } = config.appwrite;

export const userRepository = {
  async create(userId: string): Promise<UserProfile> {
    return databases.createDocument(databaseId, usersCollectionId, ID.unique(), {
      userId,
      faceEnrolled: false,
      faceTemplateRef: null,
      kycStatus: "pending" as KycStatus,
      createdAt: new Date().toISOString(),
    }) as unknown as UserProfile;
  },

  async getByUserId(userId: string): Promise<UserProfile | null> {
    const res = await databases.listDocuments(databaseId, usersCollectionId, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);
    return (res.documents[0] as unknown as UserProfile) ?? null;
  },

  async update(docId: string, data: Partial<Omit<UserProfile, "$id" | "userId" | "createdAt">>): Promise<UserProfile> {
    return databases.updateDocument(databaseId, usersCollectionId, docId, data) as unknown as UserProfile;
  },
};
