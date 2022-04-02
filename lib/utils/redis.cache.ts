import { Cache } from 'cache-manager';

import { ICache } from '../types/utils';

/**
 * redis缓存适配器
 */
export class RedisCache implements ICache {

  private namespace = 'nest-wechat:';

  /**
   * 
   * @param cache cache manager service
   */
  constructor (readonly cache: Cache) {}

  public async get<T> (key: string): Promise<T> {
    if (!key) {
      throw new Error('empty key');
    }
    key = this.namespace + key;
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
    if (!key) {
      throw new Error('empty key');
    }
    key = this.namespace + key;
    if (!ttl) {
      ttl = 0;
    }
    return this.cache.set(key, value, { ttl });
  }

  remove (key: string): boolean {
    if (!key) return false;
    key = this.namespace + key;
    try {
      this.cache.del(key);
      return true;
    } catch (error) {
      return false;
    }
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