import { TestBed, waitForAsync } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { delay } from 'rxjs/operators';
import { cold, getTestScheduler } from 'jasmine-marbles';

import { ConstantsService } from '../../services/constants.service';
import { CanActivateGchart, CanLoadGchart } from './gchart.guard';

describe('GchartGuard', () => {
  let canActivateGchart: CanActivateGchart;
  let canLoadGchart: CanLoadGchart;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ NgxsModule.forRoot([])],
      providers: [ Store ]
    });
    canActivateGchart = TestBed.inject(CanActivateGchart);
    canLoadGchart = TestBed.inject(CanLoadGchart);
    store = TestBed.inject(Store);
  });

  it('should be created canActivateGchart', () => {
    expect(canActivateGchart).toBeTruthy();
  });

  it('should canActivateGchart return true when connected$ changed to true within the set period', waitForAsync(() => {
    const q$ = cold('-f-t|', { t: true, f: false });
    spyOn(store, 'select').and.returnValue(q$.pipe(delay(ConstantsService.connectedResponseTimeout_ms - 50)));

    canActivateGchart.canActivate().subscribe((response) => {
      expect(response).toBe(true);
    });
    getTestScheduler().flush();
  }));

  it('should canActivateGchart return false when connected$ is false within the set period', waitForAsync(() => {
    const q$ = cold('-f-|', { t: true, f: false });
    spyOn(store, 'select').and.returnValue(q$.pipe(delay(ConstantsService.connectedResponseTimeout_ms - 50)));

    canActivateGchart.canActivate().subscribe((response) => {
      expect(response).toBe(false);
    });
    getTestScheduler().flush();
  }));

  it('should canActivateGchart return false when connected$ is false and set period lapses', waitForAsync(() => {
    const q$ = cold('-f-|', { t: true, f: false });
    spyOn(store, 'select').and.returnValue(q$.pipe(delay(ConstantsService.connectedResponseTimeout_ms + 1)));

    canActivateGchart.canActivate().subscribe((response) => {
      expect(response).toBe(false);
    });
    getTestScheduler().flush();
  }));

  it('should be created canLoadGchart', () => {
    expect(canLoadGchart).toBeTruthy();
  });

  it('should canLoadGchart return true when connected$ changed to true within the set period', waitForAsync(() => {
    const q$ = cold('-f-t|', { t: true, f: false });
    spyOn(store, 'select').and.returnValue(q$.pipe(delay(ConstantsService.connectedResponseTimeout_ms - 50)));

    canLoadGchart.canLoad().subscribe((response) => {
      expect(response).toBe(true);
    });
    getTestScheduler().flush();
  }));

  it('should canLoadGchart return false when connected$ is false within the set period', waitForAsync(() => {
    const q$ = cold('-f-|', { t: true, f: false });
    spyOn(store, 'select').and.returnValue(q$.pipe(delay(ConstantsService.connectedResponseTimeout_ms - 50)));

    canLoadGchart.canLoad().subscribe((response) => {
      expect(response).toBe(false);
    });
    getTestScheduler().flush();
  }));

  it('should canLoadGchart return false when connected$ is false and set period lapses', waitForAsync(() => {
    const q$ = cold('-f-|', { t: true, f: false });
    spyOn(store, 'select').and.returnValue(q$.pipe(delay(ConstantsService.connectedResponseTimeout_ms + 1)));

    canLoadGchart.canLoad().subscribe((response) => {
      expect(response).toBe(false);
    });
    getTestScheduler().flush();
  }));

});
