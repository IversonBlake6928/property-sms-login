import { z } from "zod";
import { infrai } from "./infrai";

export const loginBody = z.object({
  to: z.string().regex(/^\+[1-9]\d{7,14}$/),
  code: z.string().regex(/^\d{4,8}$/).optional(),
  maintenanceRequest: z.string().min(1),
  tenantDocument: z.string().min(1),
  inspectionReminder: z.string().min(1),
});
export type LoginBody = z.infer<typeof loginBody>;

export async function propertyLogin(input: unknown) {
  const parsed = loginBody.parse(input);
  const idempotency_key = `property-login:${parsed.to}:${parsed.maintenanceRequest}`;
  if (!parsed.code) {
    await infrai.sms.otp(parsed.to, idempotency_key);
    return { status: "code_sent", maintenanceRequest: parsed.maintenanceRequest, tenantDocument: parsed.tenantDocument, inspectionReminder: parsed.inspectionReminder };
  }
  const verification = await infrai.sms.verify(parsed.to, parsed.code, idempotency_key);
  return { status: "verified", verification, maintenanceRequest: parsed.maintenanceRequest, tenantDocument: parsed.tenantDocument, inspectionReminder: parsed.inspectionReminder };
}
