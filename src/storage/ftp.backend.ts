import { BlobBackend } from './blob-backend';
import * as path from 'path';
import { Readable, Writable } from 'stream';
import * as ftp from 'basic-ftp';

type FtpSecure = boolean | 'implicit';

export class FtpBackend extends BlobBackend {
  readonly name = 'ftp' as const;

  constructor(
    private readonly host: string,
    private readonly user: string,
    private readonly password: string,
    private readonly port: number = 21,
    private readonly secure: FtpSecure = false,
    private readonly secureRejectUnauthorized: boolean = true,
    private readonly baseDir: string = '/',
  ) {
    super();
  }

  private remotePath(id: string) {
    const base = (this.baseDir || '').replace(/^\/+/, ''); // strip leading slash
    const safeId = id.replace(/^\/+/, '');
    return base ? `${base}/${safeId}` : safeId; // simple-drive/file.txt
  }

  private async withClient<T>(fn: (c: ftp.Client) => Promise<T>): Promise<T> {
    const client = new ftp.Client(30_000);
    client.ftp.verbose = true;
    try {
      await client.access({
        host: this.host,
        user: this.user,
        password: this.password,
        port: this.port,
        secure: this.secure,
        secureOptions: this.secure
          ? { rejectUnauthorized: this.secureRejectUnauthorized }
          : undefined,
      });

      return await fn(client);
    } finally {
      client.close();
    }
  }

  protected async doPut(id: string, data: Buffer) {
    const remote = this.remotePath(id);
    const dir = path.posix.dirname(remote);
    const filename = path.posix.basename(remote);

    await this.withClient(async (c) => {
      await c.ensureDir(dir); // navigates to /ftp/ftpuser/simple-drive
      await c.uploadFrom(Readable.from(data), filename); // just filename here
    });
  }

  protected async doGet(id: string): Promise<Buffer> {
    const remote = this.remotePath(id);
    return this.withClient(async (c) => {
      const chunks: Buffer[] = [];
      const sink = new Writable({
        write(chunk, _enc, cb) {
          chunks.push(Buffer.from(chunk));
          cb();
        },
      });
      await c.downloadTo(sink, remote);
      return Buffer.concat(chunks);
    });
  }

  protected async doRemove(id: string): Promise<void> {
    const remote = this.remotePath(id);
    await this.withClient(async (c) => {
      try {
        await c.remove(remote);
      } catch (e: any) {
        // 550 usually means "not found" on FTP servers
        if (!/^\s*550\b/.test(String(e?.message ?? ''))) throw e;
      }
    });
  }
}
