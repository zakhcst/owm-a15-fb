import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Store } from '@ngxs/store';
import { OwmFallbackDataService } from '../../services/owm-fallback-data.service';
import { IOwmDataModel } from '../../models/owm-data.model';
import { switchMap } from 'rxjs/operators';
import { AppFallbackDataState } from '../../states/app.state';
import { SetFallbackDataState } from '../../states/app.actions';

@Injectable({
  providedIn: 'root',
})
export class ResolverFallbackService implements Resolve<any> {
  constructor(public _store: Store, private _owmFallback: OwmFallbackDataService) { }

  resolve(): Observable<string> | Observable<never> | Observable<IOwmDataModel> {
    const falbackData = this._store.selectSnapshot(AppFallbackDataState.selectFallbackData);
    if (falbackData) {
      return of(falbackData);
    } else {
      return this._owmFallback.getData().pipe(
        switchMap((data: IOwmDataModel) => {
          return this._store.dispatch(new SetFallbackDataState(data));
        })
      );
    }
  }
}
