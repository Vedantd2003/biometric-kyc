import { handleEnroll } from "./controller";
import type { EnrollRequest } from "./model";

export default async ({ req, res, log, error }: { req: any; res: any; log: any; error: any }) => {
  try {
    const body: EnrollRequest = JSON.parse(req.body ?? "{}");

    if (!body.userId || !body.imageBase64) {
      return res.json({ success: false, error: "Missing userId or imageBase64" }, 400);
    }

    const result = await handleEnroll(body);
    return res.json(result, result.success ? 200 : 422);
  } catch (err: unknown) {
    error(String(err));
    return res.json({ success: false, error: "Internal server error" }, 500);
  }
};
