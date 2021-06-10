import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { EMPTY, merge, Observable, of, throwError, timer } from 'rxjs';
import { debounce, distinctUntilChanged, filter, mapTo, switchMap, take, tap } from 'rxjs/operators';
import { IOwmDataModel, IOwmDataModelTimeSlotUnit } from '../models/owm-data.model';
import { SetOwmDataCacheState, SetPopupMessage, SetStatusShowLoading } from '../states/app.actions';
import { HistoryLogModel } from '../states/app.models';
import { AppOwmDataCacheState, AppStatusState } from '../states/app.state';
import { ConstantsService } from './constants.service';
import { HistoryLogService } from './history-log.service';

@Injectable({
  providedIn: 'root'
})
export class OwmDataUtilsService {
  @Select(AppOwmDataCacheState.selectOwmDataCachedOrDefaultSelectedCity) selectedCityOwmDataCache$: Observable<IOwmDataModel>;
  @Select(AppStatusState.selectStatusNormalizedIp) selectStatusNormalizedIp$: Observable<string>;
  constructor(
    private _store: Store,
    private _historyLog: HistoryLogService
  ) { }

  getOwmDataDebounced$({ showLoading }) {
    return this.selectedCityOwmDataCache$.pipe(
      filter((data) => !!data),
      tap(() => { showLoading && this.dispatchShowLoading(true); }),
      distinctUntilChanged((prev, curr) => {
        const eq = prev.updated === curr.updated;
        if (eq && showLoading) {
          this.dispatchShowLoading(false);
        }
        return eq;
      }),
      debounce((data: IOwmDataModel) =>
      (
        data.updated && this.isNotExpired(data) ?
          of(null) : timer(ConstantsService.loadingDataDebounceTime_ms)
      )
      ),
      tap(() => { showLoading && this.dispatchShowLoading(false); })
    );
  }

  setOwmDataCache(owmData, dbLiveUpdateRefresh: boolean) {
    if (!owmData || !owmData.updated) {
      return EMPTY;
    }

    const updatedCityId = owmData.city.id.toString();
    const cachedCityOwmData = this._store.selectSnapshot((state: AppOwmDataCacheState) => state['owmDataCache']?.[updatedCityId]);
    if (cachedCityOwmData && cachedCityOwmData.updated >= owmData.updated) {
      return EMPTY;
    }

    const cityName = owmData.city.name;
    const countryISO2 = owmData.city.country;
    const popupMessage = {
      message: `Refreshed: ${cityName}, ${countryISO2}`,
      class: 'popup__info',
      delay: 500
    };
    return this._store.dispatch(new SetOwmDataCacheState(owmData)).pipe(
      switchMap(() => this._store.dispatch(new SetPopupMessage(popupMessage))),
      switchMap(() => dbLiveUpdateRefresh ? EMPTY : this.selectStatusNormalizedIp$),
      filter(normalizedIp => !ConstantsService.reservedIps.includes(normalizedIp)),

      switchMap(normalizedIp => {
        const newEntry: HistoryLogModel = {
          cityId: updatedCityId,
          time: new Date().valueOf(),
        };
        return this._historyLog.setDataToFB(normalizedIp, newEntry);
      }),
    );
  }







  dispatchShowLoading(onOff: boolean) {
    this._store.dispatch(new SetStatusShowLoading(onOff));
  }

  isNotExpired(data: IOwmDataModel): boolean {
    // expired data is when either [0] || .updated is older than 3 hours
    const now = Date.now();
    const firstDateTime = data.list && data.list.length > 0 && data.list[0].dt ? data.list[0].dt * 1000 : 0;
    const dataUpdated = typeof data.updated === 'number' ? data.updated : null;
    const diff = now - (dataUpdated || firstDateTime);
    return diff < 3 * 3600 * 1000; // < 3 hours
  }

  setListByDate(data: IOwmDataModel): IOwmDataModel {
    data.listByDate = data.list.reduce((accumulator: any, item: any) => {
      const dateObj = new Date(item.dt * 1000);
      const hour = dateObj.getUTCHours();
      const date0000 = dateObj.setHours(0);

      if (accumulator[date0000]) {
        accumulator[date0000][hour] = item;
      } else {
        accumulator[date0000] = {};
        accumulator[date0000][hour] = item;
      }
      return accumulator;
    }, {});
    data.updated = new Date().valueOf();
    return data;
  }

  getDataServiceOrTimeout(service: Observable<IOwmDataModel>) {
    const timeout = timer(ConstantsService.dataResponseTimeout_ms * 2).pipe(mapTo('timedout'));
    return merge(service, timeout).pipe(
      take(1),
      switchMap((data) => (data === 'timedout') ? throwError('Service Timeout Error') : of(data))
    );
  }

  getWeatherDefaultBgImg() {
    return ConstantsService.weatherBgImgPath + ConstantsService.weatherDefaultBgImgFileName;
  }

  getWeatherBgImg(dataListHour: IOwmDataModelTimeSlotUnit) {
    const main = dataListHour.weather[0].main;
    const syspod = dataListHour.sys.pod;

    if (
      main &&
      main !== '' &&
      ConstantsService.bgImgTypes.includes(main.toLocaleLowerCase()) &&
      (syspod === 'd' || syspod === 'n')
    ) {
      return ConstantsService.weatherBgImgPath + main.toLocaleLowerCase() + '_' + syspod + '.jpg';
    } else {
      return this.getWeatherDefaultBgImg();
    }
  }


}
