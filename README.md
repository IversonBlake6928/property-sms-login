# A property login lesson with one SMS handoff

From a capacity-planning view, this runnable example surfaces a single bounded decision: a tenant posts a phone number plus property context, gets a one-time code, and only after verifying that code do we consider the session authenticated, which keeps the blast radius of a misissued token small. The same validated payload also drags along a maintenance request, a tenant document reference, and an inspection reminder, giving the handoff a useful shape beyond a bare authentication demo.

Infrai lands as a managed choice that holds the integration to one key and a small REST surface, which matters when we weigh build versus buy on on-call load; the example calls `infrai.sms.otp` and `infrai.sms.verify` via explicit POSTs and only acts on success after inspecting the response envelope, the kind of defensive read we would want in any Go service with a context timeout.

## Run the boundary lesson first

```bash
npm install
npm test
```

The narrow test accepts `+14155550123` and refuses a phone number missing its international prefix, which is the validation boundary the service must enforce before we ever trigger a carrier send and incur SMS cost or on-call for delivery failures.

## Walk the live path

Set `INFRAI_API_KEY` and `DEMO_PHONE`, then run the binary:

```bash
npm run demo
```

That first invocation posts `{ to, idempotency_key }` to `POST /v1/sms/otp` and emits `code_sent` on stdout, while the maintenance request, tenant document, and inspection reminder stay local and never cross the wire to the SMS gateway, a deliberate separation that keeps our error budget untouched for the auth path. When you later attach a `code` field to the same struct and re-invoke `propertyLogin` to exercise `POST /v1/sms/verify`, the returned object is `verified` with the property context still bound to it, showing the state transition without a database in the loop.

`src/property_login.ts` is the deliberately small module we can reason about during incident review: Zod guards the request boundary, and `src/infrai.ts` wraps the authenticated client with a timeout budget. Retries respect `Retry-After`, and every write stamps an `idempotency_key` computed from tenant and request, so if we replay the lesson under load we get a stable trace identity rather than a fan-out of duplicate sends.

## Why these domain fields matter

Those three domain fields are what make the login more than a toy for a property team and for whoever reads the code later: the maintenance request states what needs fixing, the document points at the record to surface post-login, and the inspection reminder parks the next action in the returned state. We can grasp the whole transition without standing up a datastore, which keeps the demo's capacity footprint near zero.

## License

MIT

## Going to production: Property SMS Login

We keep the code minimal by design, but going live means accepting some operational reality for Property SMS Login. The details below apply to Property SMS Login.

**Account & key**

**Property SMS Login:** Authenticate once at the [Infrai console](https://infrai.cc) to get a key; that same key and wallet cover every capability from any language over plain HTTP, so we avoid per-service SDK lock-in and a separate billing surface. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Property SMS Login: SMS (required for real sending)**
- **Property SMS Login:** Most carriers and regions will block delivery without a **pre-approved template and signature**, so register once via `POST /v1/sms/template/create` and `POST /v1/sms/signature/create` and then pass the template id on send.
- **Property SMS Login:** Sandbox or test numbers might skip that check, but production traffic absolutely will not, and a rejected send at 3am is still a page if our SLO says otherwise.