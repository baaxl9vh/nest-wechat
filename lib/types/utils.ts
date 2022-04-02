
/**
 * 缓存接口，需要自定义缓存，请实现该接口
 * 
 * cache interface, please implement this interface if you need.
 * 
 */
export interface ICache {
  get<T> (key: string): Promise<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set (key: string, value: any, ttl?: number): void;
  remove (key: string): boolean;
  close (): void;
}
