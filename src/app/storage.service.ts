import { inject, Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import type { LocationSelection } from './models/cities';
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

  async getLocation(): Promise<LocationSelection> {
    const stored = await this.getData('location');
    if (stored && stored.lat != null && stored.long != null) {
      const lat = Number(stored.lat);
      const long = Number(stored.long);
      if (Math.abs(lat) <= 90 && Math.abs(long) <= 180) return { ...stored, lat, long };
    }
    return { lat: 69.650288, long: 18.955098, source: 'default', label: 'Tromsø' };
  }
}
