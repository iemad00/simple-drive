import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('blob_data')
export class BlobData {
  @PrimaryColumn()
  id: string; // same as Blob.id when backend = 'db'

  @Column({ type: 'bytea' })
  bytes: Buffer;
}
