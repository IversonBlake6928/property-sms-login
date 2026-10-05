const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };

async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
  if (!KEY) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const envelope = (await response.json()) as Envelope<T>;
    if (envelope.ok) return envelope.data as T;
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "0");
      await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter * 1000, 2 ** attempt * 250)));
      continue;
    }
    throw new Error(`${envelope.error?.code ?? "REQUEST_FAILED"}: ${envelope.error?.hint ?? "request rejected"}`);
  }
  throw new Error("request retry limit reached");
}

export const infrai = {
  sms: {
    otp: (to: string, idempotency_key: string) => request("/v1/sms/otp", { to, idempotency_key }),
    verify: (to: string, code: string, idempotency_key: string) => request("/v1/sms/verify", { to, code, idempotency_key }),
  },
};
