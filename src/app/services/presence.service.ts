import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {

  constructor(private _db: AngularFireDatabase, @Inject(DOCUMENT) private _document: Document) { }

  updateOnConnected() {
    const connectedRef = this._db.object('.info/connected');
    return connectedRef.valueChanges();
  }

  updateOnAway(fn) {
    this._document.onvisibilitychange = fn;
  }
}
