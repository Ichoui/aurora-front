import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import type { StorageSchema } from './models/storage';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly _storage = inject(Storage);

  private _initialization?: Promise<void>;

  async init(): Promise<void> {
    this._initialization ??= (async () => {
      await this._storage.defineDriver(CordovaSQLiteDriver);
      await this._storage.create();
    })();
    return this._initialization;
  }

  setData<K extends keyof StorageSchema>(storageKey: K, key: StorageSchema[K]): Promise<StorageSchema[K]> {
    return this._storage.set(storageKey, key);
  }

  getData<K extends keyof StorageSchema>(storageKey: K): Promise<StorageSchema[K] | null> {
    return this._storage.get(storageKey);
  }
}
