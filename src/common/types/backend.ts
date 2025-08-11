export type Backend = 'fs' | 'db' | 's3' | 'ftp';

export function isBackend(val: any): val is Backend {
  return ['fs', 'db', 's3', 'ftp'].includes(val);
}
