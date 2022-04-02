import { ICache } from '../../lib/types/utils';
import { Cache } from 'cache-manager';

export default class RedisCache implements ICache {

  /**
   *
   */
  constructor (readonly cache: Cache) {}

  public async get<T> (key: string): Promise<T> {
    let value = {};
    try {
      value = await this.cache.get<T>(key) as T;
      if (!value) {
        value = {};
      }
    } catch (error) {
      value = {};
    }
    return value as T;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async set (key: string, value: any, ttl?: number): Promise<any> {
    if (!ttl) {
      ttl = 0;
    }
    return this.cache.set(key, value, { ttl });
  }

  remove (key: string): boolean {
    try {
      this.cache.del(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  clean (): void {
    throw new Error('Method not implemented.');
  }

  close (): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (this.cache.store as any).getClient === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = (this.cache.store as any).getClient();
      if (client) {
        client.quit();
      }
    }
  }

}