import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsModule, Store } from '@ngxs/store';
import { of } from 'rxjs';
import { SharedModule } from '../../modules/shared.module';
import { ErrorsService } from '../../services/errors.service';
import { SnackbarService } from '../../services/snackbar.service';
import { MockErrorsService, historyLogMockData } from '../../services/testing.services.mocks';
import { AppCitiesState, AppHistoryLogState, AppStatsState, AppStatusState } from '../../states/app.state';

import { StatsComponent } from './stats.component';

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;
  let store: Store;
  let mockErrorsService: MockErrorsService;

  beforeEach(
    waitForAsync(() => {
      mockErrorsService = new MockErrorsService();
      TestBed.configureTestingModule({
        imports: [
          BrowserModule,
          BrowserAnimationsModule,
          SharedModule,
          NgxsModule.forRoot([AppStatusState, AppCitiesState, AppHistoryLogState, AppStatsState]),
        ],
        declarations: [StatsComponent],
        providers: [SnackbarService, Store,
          { provide: ErrorsService, useValue: mockErrorsService }],
      }).compileComponents();
      store = TestBed.inject(Store);
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it('should not keyEvent when key != e', () => {
    const spyOnToggleShowErrors = spyOn(component, 'toggleShowErrors');
    const event: any = { key: '0' };
    component.keyEvent(event);
    expect(spyOnToggleShowErrors).toHaveBeenCalledTimes(0);
  });

  it('should keyEvent', () => {
    const spyOnToggleShowErrors = spyOn(component, 'toggleShowErrors');
    const event: any = { key: 'e' };
    component.keyEvent(event);
    expect(spyOnToggleShowErrors).toHaveBeenCalledTimes(1);
  });

  it('should subscribeStats', waitForAsync(() => {
    const value = 'stats';
    const spyOnStats$ = spyOnProperty(component, 'stats$').and.returnValue(of(value));
    component.subscribeStats();
    expect(spyOnStats$).toHaveBeenCalledTimes(1);
    expect(component.stats).toBe(value);
  }));

  it('should subscribeCities', waitForAsync(() => {
    fixture.detectChanges();
    const value: any = { citiId1: 1, citiId2: 2 };
    const spyOnCities$ = spyOnProperty(component, 'cities$').and.returnValue(of(value));
    component.subscribeCities();
    expect(spyOnCities$).toHaveBeenCalledTimes(1);
    expect(component.cities).toBe(value);
  }));

  it('should subscribeErrorsLog', waitForAsync(() => {
    fixture.detectChanges();
    component.subscribeErrorsLog();
    expect(component.errorsLog).toBeTruthy();
  }));

  it('should subscribeHistoryLog', waitForAsync(() => {
    const spyOnHistoryLog$ = spyOnProperty(component, 'historyLogState$').and.returnValue(of(historyLogMockData));
    fixture.detectChanges();
    component.subscribeHistoryLog();
    expect(component.historyLog).toBeTruthy();
  }));

  it('should setLog$', waitForAsync(() => {
    component.setLog$(of(historyLogMockData), false).subscribe(sortedTrimmedEntries => {
      const first = sortedTrimmedEntries[0];
      const last = sortedTrimmedEntries[sortedTrimmedEntries.length - 1];
      expect(first[0]).toBeGreaterThan(last[0]);
      expect(last[1][1]).toBeGreaterThan(last[1][last.length - 1]);

    });
  }));

  it('should setLog$ when filter is true', waitForAsync(() => {
    component.setLog$(of(historyLogMockData), true).subscribe(sortedTrimmedEntries => {
      const first = sortedTrimmedEntries[0];
      const last = sortedTrimmedEntries[sortedTrimmedEntries.length - 1];
      expect(first[0]).toBeGreaterThan(last[0]);
      expect(last[1][1]).toBeGreaterThan(last[1][last.length - 1]);

    });
  }));

  it('should toggleShowErrors subscribe', waitForAsync(() => {
    const spyOnSubscribeErrorsLog = spyOn(component, 'subscribeErrorsLog');
    component.showErrors = false;
    component.firstShowErrors = true;
    fixture.detectChanges();
    component.toggleShowErrors();
    expect(component.showErrors).toBe(true);
    expect(spyOnSubscribeErrorsLog).toHaveBeenCalledTimes(1);
  }));

  it('should toggleShowErrors not subscribe when showErrors false', waitForAsync(() => {
    const spyOnSubscribeErrorsLog = spyOn(component, 'subscribeErrorsLog');
    component.showErrors = true;
    component.firstShowErrors = true;
    fixture.detectChanges();
    component.toggleShowErrors();
    expect(component.showErrors).toBe(false);
    expect(spyOnSubscribeErrorsLog).toHaveBeenCalledTimes(0);
  }));



});
