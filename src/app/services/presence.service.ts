import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {

  constructor(private _db: AngularFireDatabase, @Inject(DOCUMENT) private _document: Document) { }

  updateOnConnected(): Observable<Boolean> {
    const connectedRef = this._db.object('.info/connected');
    return <any>connectedRef.valueChanges();
  }

  updateOnAway(fn) {
    this._document.onvisibilitychange = fn;
  }
}
