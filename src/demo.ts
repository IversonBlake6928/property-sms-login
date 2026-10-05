import { propertyLogin } from "./property_login";

const to = process.env.DEMO_PHONE;
if (!to) throw new Error("Set DEMO_PHONE to a tenant phone number");
const result = await propertyLogin({ to, maintenanceRequest: "leaking kitchen tap", tenantDocument: "lease-2026.pdf", inspectionReminder: "annual safety check" });
console.log(result);
