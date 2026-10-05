import assert from "node:assert/strict";
import { loginBody } from "../src/property_login";

const accepted = loginBody.parse({ to: "+14155550123", maintenanceRequest: "heater", tenantDocument: "lease.pdf", inspectionReminder: "Friday" });
assert.equal(accepted.to, "+14155550123");
assert.throws(() => loginBody.parse({ to: "4155550123", maintenanceRequest: "heater", tenantDocument: "lease.pdf", inspectionReminder: "Friday" }));
console.log("property login boundary checks passed");
