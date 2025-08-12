import { Backend } from 'src/common/types/backend';
import { BlobBackend } from './blob-backend';

export const BACKENDS = Symbol('BACKENDS');
export type BackendMap = Record<Backend, BlobBackend | undefined>;
