import { TestBed, waitForAsync } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { delay } from 'rxjs/operators';
import { cold, getTestScheduler } from 'jasmine-marbles';

import { ConstantsService } from '../../services/constants.service';
import { CanActivateGchart, CanLoadGChart } from './gchart.guard';

describe('GchartGuard', () => {
  let canActivateGchart: CanActivateGchart;
  let canLoadGChart: CanLoadGChart;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ NgxsModule.forRoot([])],
      providers: [ Store ]
    });
    canActivateGchart = TestBed.inject(CanActivateGchart);
    canLoadGChart = TestBed.inject(CanLoadGChart);
    store = TestBed.inject(Store);
  });

  it('should be created canActivateGchart', () => {
    expect(canActivateGchart).toBeTruthy();
  });

  it('should canActivateGchart return true when connected$ changed to true within the set period', waitForAsync(() => {
    const q$ = cold('-f-t|', { t: true, f: false });
    spyOn(store, 'select').and.returnValue(q$.pipe(delay(ConstantsService.connectedResponseTimeLimit_ms - 50)));

    canActivateGchart.canActivate().subscribe((response) => {
      expect(response).toBe(true);
    });
    getTestScheduler().flush();
  }));

  it('should canActivateGchart return false when connected$ is false within the set period', waitForAsync(() => {
    const q$ = cold('-f-|', { t: true, f: false });
    spyOn(store, 'select').and.returnValue(q$.pipe(delay(ConstantsService.connectedResponseTimeLimit_ms - 50)));

    canActivateGchart.canActivate().subscribe((response) => {
      expect(response).toBe(false);
    });
    getTestScheduler().flush();
  }));

  it('should canActivateGchart return false when connected$ is false and set period lapses', waitForAsync(() => {
    const q$ = cold('-f-|', { t: true, f: false });
    spyOn(store, 'select').and.returnValue(q$.pipe(delay(ConstantsService.connectedResponseTimeLimit_ms + 1)));

    canActivateGchart.canActivate().subscribe((response) => {
      expect(response).toBe(false);
    });
    getTestScheduler().flush();
  }));

  it('should be created canLoadGChart', () => {
    expect(canLoadGChart).toBeTruthy();
  });

  it('should canLoadGChart return true when connected$ changed to true within the set period', waitForAsync(() => {
    const q$ = cold('-f-t|', { t: true, f: false });
    spyOn(store, 'select').and.returnValue(q$.pipe(delay(ConstantsService.connectedResponseTimeLimit_ms - 50)));

    canLoadGChart.canLoad().subscribe((response) => {
      expect(response).toBe(true);
    });
    getTestScheduler().flush();
  }));

  it('should canLoadGChart return false when connected$ is false within the set period', waitForAsync(() => {
    const q$ = cold('-f-|', { t: true, f: false });
    spyOn(store, 'select').and.returnValue(q$.pipe(delay(ConstantsService.connectedResponseTimeLimit_ms - 50)));

    canLoadGChart.canLoad().subscribe((response) => {
      expect(response).toBe(false);
    });
    getTestScheduler().flush();
  }));

  it('should canLoadGChart return false when connected$ is false and set period lapses', waitForAsync(() => {
    const q$ = cold('-f-|', { t: true, f: false });
    spyOn(store, 'select').and.returnValue(q$.pipe(delay(ConstantsService.connectedResponseTimeLimit_ms + 1)));

    canLoadGChart.canLoad().subscribe((response) => {
      expect(response).toBe(false);
    });
    getTestScheduler().flush();
  }));

});
