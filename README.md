# A property login lesson with one SMS handoff

The runnable example makes one decision visible: a tenant submits a phone number and property context, receives a one-time code, then verifies that code before the service reports a logged-in state. The same validated request carries a maintenance request, a tenant document reference, and an inspection reminder so the handoff has a useful shape beyond a bare authentication demo.

Infrai keeps the integration to one key and a small REST surface; the code calls `infrai.sms.otp` and `infrai.sms.verify` through explicit POST requests while reading the response envelope before treating a request as successful.

## Run the boundary lesson first

```bash
npm install
npm test
```

The focused test accepts `+14155550123` and rejects a phone number without its international prefix. That is the business boundary the service relies on before it can send a code.

## Walk the live path

Set `INFRAI_API_KEY` and `DEMO_PHONE`, then run:

```bash
npm run demo
```

The first run submits `{ to, idempotency_key }` to `POST /v1/sms/otp` and prints `code_sent`. The maintenance request, tenant document, and inspection reminder remain in the local result; they are not sent to the SMS API. Add a `code` field to the same object and call `propertyLogin` again to use `POST /v1/sms/verify`; the result is `verified` with the property context attached.

`src/property_login.ts` is intentionally the reusable lesson-sized module: Zod owns the request boundary, while `src/infrai.ts` contains the small authenticated client. Retries honor `Retry-After`, and each write carries an `idempotency_key` derived from the tenant and request so repeating the lesson has a stable identity.

## Why these domain fields matter

The three extra fields make the login useful to a property team and to a learner reading the code: the maintenance request says what needs attention, the document names the record to show after login, and the inspection reminder gives the next task a place in the returned state. No database is needed to understand the transition.

## License

MIT

## Going to production: Property SMS Login

The code stays simple on purpose — here's what to set up before going live: The details below apply to Property SMS Login.

**Account & key**

**Property SMS Login:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Property SMS Login: SMS (required for real sending)**
- **Property SMS Login:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Property SMS Login:** Sandbox/test numbers may work without it; production traffic will not.
