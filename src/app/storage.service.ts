import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Currently, Daily, Hourly } from './models/weather';
import { CodeLocation } from './models/cities';
import { roundTwoNumbers } from './models/utils';

@Injectable({
    providedIn: 'root'
})
// https://www.youtube.com/watch?v=vCfAe2esboU tuto storage
export class StorageService {
    private _storageReady = new BehaviorSubject(false)
    constructor(private _storage: Storage) {
    }

    async init(): Promise<void> {
        await this._storage.defineDriver(CordovaSQLiteDriver)
        await this._storage.create();
        this._storageReady.next(true)
    }

    setData(storageKey: string, key: unknown): Promise<unknown> {
        return this._storage.set(storageKey, key);
    }

    getData(storageKey: string): Promise<unknown> {
        return  this._storage.get(storageKey)
    }
}
