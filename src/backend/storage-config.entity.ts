import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('storage_config')
export class StorageConfig {
  @PrimaryColumn()
  key: string;

  @Column()
  value: string;
}
