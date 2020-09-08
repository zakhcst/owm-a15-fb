import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { map, tap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { SetStatusConnected, SetStatusAway } from '../states/app.actions';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {

  constructor(private _db: AngularFireDatabase, private _store: Store) { }

  updateOnConnected() {
    const connectedRef = this._db.object('.info/connected');
    return connectedRef.valueChanges().pipe(
      tap(status => this._store.dispatch(new SetStatusConnected(!!status)))
    );
  }
  updateOnAway() {
    this._store.dispatch(new SetStatusAway(document.visibilityState === 'hidden'));
    document.onvisibilitychange = (event) => {
      this._store.dispatch(new SetStatusAway(document.visibilityState === 'hidden'));
    };
  }
}
