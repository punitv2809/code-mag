// store/JsonStore.ts
import Store from 'electron-store';

class JsonStore {
  private store: Store;

  constructor() {
    this.store = new Store();
  }

  // Save a JSON object to a key
  public save<T = any>(key: string, value: T): void {
    this.store.set(key, value);
  }

  // Get the value for a key (returns undefined if not found)
  public get<T = any>(key: string): T | undefined {
    return this.store.get(key) as T | undefined;
  }

  // Optional: Delete a key
  public delete(key: string): void {
    this.store.delete(key);
  }

  // Optional: Check if key exists
  public has(key: string): boolean {
    return this.store.has(key);
  }

  // Optional: Clear everything
  public clear(): void {
    this.store.clear();
  }
}

export default new JsonStore();
