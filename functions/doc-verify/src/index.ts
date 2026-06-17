import { handleDocVerify } from "./controller";
import type { DocVerifyRequest } from "./model";

export default async ({ req, res, log, error }: { req: any; res: any; log: any; error: any }) => {
  try {
    const body: DocVerifyRequest = JSON.parse(req.body ?? "{}");
    if (!body.fileBase64 || !body.mimeType || !body.docType || !body.userName) {
      return res.json({ success: false, error: "Missing required fields" }, 400);
    }
    const result = await handleDocVerify(body);
    return res.json(result, result.success ? 200 : 500);
  } catch (err: unknown) {
    error(String(err));
    return res.json({ success: false, error: "Internal server error" }, 500);
  }
};
