import { env } from '@/config/env';

const seen = new Set<string>();

/** Console warning shown once per key, development builds only. */
export function warnOnce(key: string, message: string): void {
  if (!env.isDev || seen.has(key)) return;
  seen.add(key);
  console.warn(`%c[EIC • WordPress setup]%c ${message}`, 'color:#c8962e;font-weight:bold', 'color:inherit');
}
