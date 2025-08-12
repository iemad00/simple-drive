import crypto from 'crypto';

/* =========================
 * Public helpers & types
 * ========================= */

export type HttpMethod = 'GET' | 'PUT' | 'POST' | 'DELETE' | 'HEAD';

export interface SignV4Input {
  method: HttpMethod; // 'GET' | 'PUT' | ...
  url: string;
  region: string;
  service?: 's3'; // kept for future extensibility
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string; // for temporary creds
  headers?: Record<string, string>; // extra headers to send (e.g. content-type)
  payloadHash: string; // sha256 hex of body (or EMPTY_SHA256 for GET/DELETE)
  now?: Date; // injectable clock for tests
}

export interface SignV4Output {
  headers: Readonly<Record<string, string>>;
  amzDate: string;
  signedHeaders: string;
  signature: string;
}

export const EMPTY_SHA256 = sha256Hex(''); // use for GET/DELETE, empty body

export function sha256Hex(data: Buffer | string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/* =========================
 * Internal helpers
 * ========================= */

const pad2 = (n: number) => (n < 10 ? '0' + n : '' + n);

function hmac(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function formatAmzDates(now = new Date()): {
  amzDate: string;
  dateStamp: string;
} {
  const yyyy = now.getUTCFullYear();
  const mm = pad2(now.getUTCMonth() + 1);
  const dd = pad2(now.getUTCDate());
  const HH = pad2(now.getUTCHours());
  const MM = pad2(now.getUTCMinutes());
  const SS = pad2(now.getUTCSeconds());
  return {
    amzDate: `${yyyy}${mm}${dd}T${HH}${MM}${SS}Z`, // YYYYMMDDTHHMMSSZ
    dateStamp: `${yyyy}${mm}${dd}`, // YYYYMMDD
  };
}

function canonicalizeQuery(u: URL): string {
  // RFC3986: sort by key, encode key/value, join with &
  return Array.from(u.searchParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

function canonicalizeHeaders(h: Record<string, string>): {
  canonicalHeaders: string;
  signedHeaders: string;
} {
  // Lowercase keys, trim values, collapse internal spaces, sort
  const entries = Object.entries(h)
    .map(([k, v]) => [k.toLowerCase(), v.trim().replace(/\s+/g, ' ')] as const)
    .sort(([a], [b]) => a.localeCompare(b));

  const canonicalHeaders = entries.map(([k, v]) => `${k}:${v}\n`).join('');
  const signedHeaders = entries.map(([k]) => k).join(';');
  return { canonicalHeaders, signedHeaders };
}

function deriveSigningKey(
  secretAccessKey: string,
  dateStamp: string,
  region: string,
  service: string,
): Buffer {
  const kDate = hmac('AWS4' + secretAccessKey, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

function assertHttpMethod(method: string): asserts method is HttpMethod {
  const ok = ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'].includes(
    method.toUpperCase(),
  );
  if (!ok) throw new Error(`Unsupported HTTP method: ${method}`);
}

/* =========================
 * Main signer
 * ========================= */

export function signAwsV4(input: SignV4Input): SignV4Output {
  const {
    method,
    url,
    region,
    service = 's3',
    accessKeyId,
    secretAccessKey,
    sessionToken,
    headers = {},
    payloadHash,
    now,
  } = input;

  assertHttpMethod(method);

  const { amzDate, dateStamp } = formatAmzDates(now);
  const u = new URL(url);

  // Build the exact header set that will be sent (include required x-amz-* BEFORE signing)
  const baseHeaders: Record<string, string> = {
    host: u.host,
    'x-amz-date': amzDate,
    date: amzDate,
    'x-amz-content-sha256': payloadHash,
    ...(sessionToken ? { 'x-amz-security-token': sessionToken } : {}),
    ...headers,
  };

  // Canonical request
  const canonicalUri = encodeURI(u.pathname).replace(/%2F/g, '/'); // keep '/' intact
  const canonicalQuery = canonicalizeQuery(u);
  const { canonicalHeaders, signedHeaders } = canonicalizeHeaders(baseHeaders);

  const canonicalRequest =
    `${method.toUpperCase()}\n` +
    `${canonicalUri}\n` +
    `${canonicalQuery}\n` +
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    `${payloadHash}`;

  // String to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign =
    `${algorithm}\n` +
    `${amzDate}\n` +
    `${scope}\n` +
    `${sha256Hex(canonicalRequest)}`;

  // Signature
  const signingKey = deriveSigningKey(
    secretAccessKey,
    dateStamp,
    region,
    service,
  );
  const signature = crypto
    .createHmac('sha256', signingKey)
    .update(stringToSign)
    .digest('hex');

  // Authorization
  const Authorization = `${algorithm} Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  // Return an immutable view to prevent changes downstream
  const outHeaders = Object.freeze({ ...baseHeaders, Authorization });

  return Object.freeze({
    headers: outHeaders,
    amzDate,
    signedHeaders,
    signature,
    canonicalRequest,
    stringToSign,
  });
}
