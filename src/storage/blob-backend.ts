import { Backend } from 'src/common/types/backend';

export abstract class BlobBackend {
  abstract readonly name: Backend;

  async put(id: string, data: Buffer): Promise<void> {
    this.validateId(id);
    this.validateData(data);

    // We will store data as a Buffer, smaller than base64
    await this.doPut(id, data);
  }

  async get(id: string): Promise<string> {
    this.validateId(id);

    // Convert it back to base64
    return (await this.doGet(id)).toString('base64');
  }

  async remove(id: string): Promise<void> {
    this.validateId(id);
    await this.doRemove(id);
  }

  protected abstract doPut(id: string, data: Buffer): Promise<void>;
  protected abstract doGet(id: string): Promise<Buffer>;
  protected abstract doRemove(id: string): Promise<void>;

  protected validateId(id: string) {
    if (!/^[A-Za-z0-9._-]+$/.test(id)) throw new Error('Invalid id format');
  }
  protected validateData(data: Buffer) {
    if (!data?.length) throw new Error('Empty data');
  }
}
