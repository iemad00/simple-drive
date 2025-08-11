export interface OtpStore {
  set(phone: string, value: string, ttlSec: number): Promise<void>;
  get(phone: string): Promise<string | null>;
  del(phone: string): Promise<void>;
}

export interface OtpGenerator {
  generate(): string;
}
