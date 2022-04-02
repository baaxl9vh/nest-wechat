import { ICache } from '../types/utils';

export class MapCache implements ICache {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected map: Map<string, any> = new Map();

  public get<T> (key: string): Promise<T> {
    return new Promise((resolve) => {
      resolve(this.map.get(key));
    });
  }

  public set<T> (key: string, value: string | T): void {
    this.map.set(key, value);
  }

  remove (key: string): boolean {
    return this.map.delete(key);
  }

  close (): void {
    return;
  }

}