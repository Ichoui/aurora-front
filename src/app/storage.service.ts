import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

const STORAGE_KEY = '__dbAurora';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    constructor(private storage: Storage) {
        // this.init();
    }

    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
   async init() {
        // defineDrive(CordovaSqlLiteDriver) // Futur! pour cordova
        // https://www.youtube.com/watch?v=vCfAe2esboU tuto storage
        await this.storage.create();
    }

    async setData(storageKey: string, key: string | Record<string,string | number>) {
        const storedData = await this.storage.get(STORAGE_KEY) || [];
        storedData.push(key);
        return this.storage.set(storageKey, storedData);
    }

    async removeData(storageKey: string, index: number) {
        const storedData = await this.storage.get(STORAGE_KEY) || [];
        storedData.splice(index, 1);
        return this.storage.set(storageKey, storedData);
    }

    async getData(storageKey: string) {
        const storedData = await this.storage.get(STORAGE_KEY) || [];
        return storedData.find(data => storageKey === data);
    }
}
