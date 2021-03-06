import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ConstantsService } from './constants.service';
import { IOwmDataModel } from '../models/owm-data.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private _db: AngularFireDatabase) {}


  getData(cityId: string): Observable<IOwmDataModel> {
    return this._db.object<IOwmDataModel>(ConstantsService.owmData + '/' + cityId).valueChanges();
  }

  setData(cityId: string, data: IOwmDataModel) {
    const ref = this._db.object(ConstantsService.owmData + '/' + cityId);
    return ref.set(data);
  }
}
