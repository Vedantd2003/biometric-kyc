export const config = {
  appwrite: {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
    documentsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTS_COLLECTION_ID!,
    storageBucketId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!,
  },
  hyperverge: {
    appId: process.env.NEXT_PUBLIC_HYPERVERGE_APP_ID!,
  },
} as const;
