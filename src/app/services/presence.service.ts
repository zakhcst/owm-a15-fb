import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {

  constructor(private _db: AngularFireDatabase) { }

  updateOnConnected() {
    const connectedRef = this._db.object('.info/connected');
    return connectedRef.valueChanges();
  }

  updateOnAway(fn) {
    document.onvisibilitychange = fn;
  }
}
