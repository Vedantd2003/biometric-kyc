import { handleAuthenticate } from "./controller";
import type { AuthenticateRequest } from "./model";

export default async ({ req, res, log, error }: { req: any; res: any; log: any; error: any }) => {
  try {
    const body: AuthenticateRequest = JSON.parse(req.body ?? "{}");
    if (!body.userId || !body.imageBase64 || !body.faceTemplateRef) {
      return res.json({ success: false, error: "Missing required fields" }, 400);
    }
    const result = await handleAuthenticate(body);
    return res.json(result, result.success ? 200 : 401);
  } catch (err: unknown) {
    error(String(err));
    return res.json({ success: false, error: "Internal server error" }, 500);
  }
};
