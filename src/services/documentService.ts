import { Functions } from "appwrite";
import client from "@/lib/appwrite";
import { toBase64 } from "@/lib/utils";
import type { DocVerifyResponse } from "@/models/types";

const functions = new Functions(client);

export const documentService = {
  async verify(file: File, docType: string, userName: string): Promise<DocVerifyResponse> {
    const fileBase64 = await toBase64(file);
    const result = await functions.createExecution(
      "doc-verify",
      JSON.stringify({ fileBase64, mimeType: file.type, docType, userName }),
      false
    );
    return JSON.parse(result.responseBody) as DocVerifyResponse;
  },
};
