import { BlobBackend } from './blob-backend';
import { signAwsV4, sha256Hex, EMPTY_SHA256 } from './s3-signv4.util';
import { request } from 'undici';

export class S3HttpBackend extends BlobBackend {
  readonly name = 's3' as const;

  constructor(
    private readonly endpoint: string,
    private readonly region: string,
    private readonly bucket: string,
    private readonly accessKeyId: string,
    private readonly secretAccessKey: string,
    private readonly sessionToken?: string,
  ) {
    super();
  }

  private encodeKey(id: string) {
    return encodeURIComponent(id).replace(/%2F/g, '/');
  }

  // Build URL and avoid double-inserting the bucket if endpoint already has it
  private objectUrl(id: string) {
    const base = this.endpoint.replace(/\/+$/, '');
    const u = new URL(base);
    const hasBucketInHost = u.host.startsWith(`${this.bucket}.`);
    const key = this.encodeKey(id);
    return hasBucketInHost ? `${base}/${key}` : `${base}/${this.bucket}/${key}`;
  }

  private async fetchSigned(
    method: 'GET' | 'PUT' | 'DELETE',
    url: string,
    payload?: Buffer,
    extraHeaders?: Record<string, string>,
  ) {
    const payloadHash = payload ? sha256Hex(payload) : EMPTY_SHA256;
    const { headers } = signAwsV4({
      method,
      url,
      region: this.region,
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
      sessionToken: this.sessionToken,
      headers: extraHeaders,
      payloadHash,
    });

    // follow one redirect (S3 can return 301/307)
    const res = await request(url, { method, body: payload, headers });
    if (res.statusCode === 301 || res.statusCode === 307) {
      const loc = res.headers.location as string | undefined;
      if (loc) {
        const res2 = await request(loc, { method, body: payload, headers });
        return res2;
      }
    }
    return res;
  }

  private async throwIfError(
    op: string,
    res: Awaited<ReturnType<typeof request>>,
  ) {
    if (res.statusCode < 300) return;
    const body = await res.body.text();
    const reqId = (res.headers['x-amz-request-id'] ||
      res.headers['x-amz-id-2'] ||
      '') as string;
    throw new Error(
      `S3 ${op} failed ${res.statusCode} ${reqId ? `[${reqId}]` : ''}: ${body}`,
    );
  }

  protected async doPut(id: string, data: Buffer): Promise<void> {
    const url = this.objectUrl(id);
    const res = await this.fetchSigned('PUT', url, data, {
      'content-type': 'application/octet-stream',
    });
    await this.throwIfError('PUT', res);
  }

  protected async doGet(id: string): Promise<Buffer> {
    const url = this.objectUrl(id);
    const res = await this.fetchSigned('GET', url);
    if (res.statusCode === 404) throw new Error('S3 GET: object not found');
    await this.throwIfError('GET', res);
    const ab = await res.body.arrayBuffer();
    return Buffer.from(ab);
  }

  protected async doRemove(id: string): Promise<void> {
    const url = this.objectUrl(id);
    const res = await this.fetchSigned('DELETE', url);
    // treat 404 as success
    if (res.statusCode >= 300 && res.statusCode !== 404) {
      await this.throwIfError('DELETE', res);
    }
  }
}
