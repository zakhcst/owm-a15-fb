import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsModule, Store } from '@ngxs/store';
import { of } from 'rxjs';
import { SharedModule } from 'src/app/modules/shared.module';
import { ErrorsService } from 'src/app/services/errors.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { cities, MockErrorsService, historyLogMockData } from 'src/app/services/testing.services.mocks';
import { AppCitiesState, AppHistoryLogState, AppStatsState, AppStatusState } from 'src/app/states/app.state';

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
    const event: any = { key: '0'};
    component.keyEvent(event);
    expect(spyOnToggleShowErrors).toHaveBeenCalledTimes(0);
  });

  it('should keyEvent', () => {
    const spyOnToggleShowErrors = spyOn(component, 'toggleShowErrors');
    const event: any = { key: 'e'};
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
