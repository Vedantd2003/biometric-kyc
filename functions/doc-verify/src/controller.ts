import { extractDocument } from "./service";
import type { DocVerifyRequest, DocVerifyResponse } from "./model";

const REQUIRED_FIELDS = ["name", "dob", "id_number"];

function nameMatches(docName: string, userName: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const doc = normalize(docName);
  const user = normalize(userName);
  // Accept if either name contains the other (handles middle name variations)
  return doc.includes(user) || user.includes(doc) || doc.split(" ").some((w) => user.includes(w));
}

export async function handleDocVerify(req: DocVerifyRequest): Promise<DocVerifyResponse> {
  const { fileBase64, mimeType, userName } = req;
  const apiKey = process.env.SARVAM_API_KEY!;

  const ocr = await extractDocument(fileBase64, mimeType, apiKey);

  const missingFields = REQUIRED_FIELDS.filter((f) => !ocr.fields[f]);
  if (missingFields.length > 0) {
    return {
      success: true,
      ocrResult: { rawText: ocr.text, fields: ocr.fields, confidence: ocr.confidence },
      verificationStatus: "failed",
      failureReason: `Missing required fields: ${missingFields.join(", ")}`,
    };
  }

  const docName = ocr.fields.name ?? "";
  if (!nameMatches(docName, userName)) {
    return {
      success: true,
      ocrResult: { rawText: ocr.text, fields: ocr.fields, confidence: ocr.confidence },
      verificationStatus: "failed",
      failureReason: "Name on document does not match account name.",
    };
  }

  return {
    success: true,
    ocrResult: { rawText: ocr.text, fields: ocr.fields, confidence: ocr.confidence },
    verificationStatus: "verified",
  };
}
