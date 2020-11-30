import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RequiredModules } from '../../modules/required.module';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

import { ForecastFlexComponent } from './forecast-flex.component';
import { AppSnackBarInnerComponent } from '../app-snack-bar-inner/app-snack-bar-inner.component';
import { SortCitiesPipe } from '../../pipes/sort-cities.pipe';

import { OwmDataManagerService } from '../../services/owm-data-manager.service';
// import { CitiesService } from '../../services/cities.service';
// import { OwmStatsService } from '../../services/owm-stats.service';
// import { GetBrowserIpService } from '../../services/get-browser-ip.service';
import { HistoryService } from '../../services/history.service';
import { ErrorsService } from '../../services/errors.service';

import {
  // MockGetBrowserIpService,
  // MockOwmStatsService,
  // MockCitiesService,
  MockOwmDataService,
  MockHistoryService,
  MockErrorsService,
  getNewDataObject,
  // getNewCitiesObject
} from '../../services/testing.services.mocks';
import { DebugElement } from '@angular/core';

describe('ForecastComponent services', () => {
  let mockOwmDataService: MockOwmDataService;
  // let mockCitiesService: MockCitiesService;
  // let mockGetBrowserIpService: MockGetBrowserIpService;
  // let mockOwmStatsService: MockOwmStatsService;
  let mockErrorsService: MockErrorsService;
  let mockHistoryService: MockHistoryService;

  // let citiesService: CitiesService;
  let owmDataService: OwmDataManagerService;
  // let getBrowserIpService: GetBrowserIpService;
  // let owmStatsService: OwmStatsService;
  let historyService: HistoryService;
  let errorsService: ErrorsService;

  let component: ForecastFlexComponent;
  let fixture: ComponentFixture<ForecastFlexComponent>;
  let debugElement: DebugElement;

  function resetLocalStorage() {
    localStorage.removeItem('mockGetBrowserIpServiceError');
    localStorage.removeItem('mockOwmStatsServiceError');
    localStorage.removeItem('mockCitiesServiceError');
    localStorage.removeItem('OwmDataManagerService');
    localStorage.removeItem('mockIp');
  }

  beforeEach(waitForAsync(() => {
    mockOwmDataService = new MockOwmDataService();
    // mockGetBrowserIpService = new MockGetBrowserIpService();
    // mockOwmStatsService = new MockOwmStatsService();
    // mockCitiesService = new MockCitiesService();
    mockHistoryService = new MockHistoryService();
    mockErrorsService = new MockErrorsService();
    TestBed.configureTestingModule({
      declarations: [
        ForecastFlexComponent,
        AppSnackBarInnerComponent,
        SortCitiesPipe
      ],
      imports: [RequiredModules],
      providers: [
        ForecastFlexComponent,
        { provide: OwmDataManagerService, useValue: mockOwmDataService },
        // { provide: GetBrowserIpService, useValue: mockGetBrowserIpService },
        // { provide: OwmStatsService, useValue: mockOwmStatsService },
        // { provide: CitiesService, useValue: mockCitiesService }
        { provide: HistoryService, useValue: mockHistoryService },
        { provide: ErrorsService, useValue: mockErrorsService },
      ]
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [AppSnackBarInnerComponent]
        }
      })
      .compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ForecastFlexComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    resetLocalStorage();
  }));

  afterEach(() => {
    resetLocalStorage();
  });

  it('should have all async data', waitForAsync(() => {
    owmDataService = debugElement.injector.get(OwmDataManagerService);
    historyService = debugElement.injector.get(HistoryService);
    errorsService = debugElement.injector.get(ErrorsService);

    expect(component.loadingOwmData).toBe(true);

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.weatherData).toBeTruthy('component.weatherData');

      expect(component.loadingOwmData).toBe(false);
      expect(component).toBeTruthy('expect(component');
      expect(owmDataService).toBeTruthy('expect(owmDataService');
      expect(historyService).toBeTruthy('expect(historyService');
      expect(errorsService).toBeTruthy('expect(errorsService');
    });
  }));

  it('should get stats from OwmStatsService', waitForAsync(() => {
    const stats = { r: 1000, u: 1000 };
    localStorage.setItem('mockOwmStatsService', JSON.stringify(stats));
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(mockHistoryService.messages.length).toBe(1);
      expect(mockErrorsService.messages.length).toBe(0);
    });
  }));

  it('should add error on failing service OwmStatsService', waitForAsync(() => {
    expect(mockHistoryService.messages.length).toBe(0);
    expect(mockErrorsService.messages.length).toBe(0);
    localStorage.setItem('mockOwmStatsServiceError', 'true');
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(mockHistoryService.messages.length).toBe(1);
      expect(mockErrorsService.messages.length).toBe(1);
    });
  }));

  it('should get cities from CitiesService', waitForAsync(() => {
    expect(mockErrorsService.messages.length).toBe(0);
    expect(mockHistoryService.messages.length).toBe(0);
    expect(component.loadingError).toBe(false);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      // expect(component.cities).toEqual(getNewCitiesObject());
      expect(component.loadingError).toBe(false);
      expect(mockHistoryService.messages.length).toBe(1);
      expect(mockErrorsService.messages.length).toBe(0);
    });
  }));

  it('should add error on failing service CitiesService', waitForAsync(() => {
    expect(mockErrorsService.messages.length).toBe(0);
    expect(mockHistoryService.messages.length).toBe(0);
    expect(component.loadingError).toBe(false);
    localStorage.setItem('mockCitiesServiceError', 'true');
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.loadingError).toBe(true);
      expect(mockHistoryService.messages.length).toBe(0);
      expect(mockErrorsService.messages.length).toBe(1);
    });
  }));

  it('should get data from OwmDataService', waitForAsync(() => {
    expect(mockErrorsService.messages.length).toBe(0);
    expect(mockHistoryService.messages.length).toBe(0);
    expect(component.loadingError).toBe(false);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.weatherData).toEqual(getNewDataObject());
      expect(component.loadingError).toBe(false);
      expect(mockHistoryService.messages.length).toBe(1);
      expect(mockErrorsService.messages.length).toBe(0);
    });
  }));

  it('should add error on failing service OwmDataService', waitForAsync(() => {
    expect(mockErrorsService.messages.length).toBe(0);
    expect(mockHistoryService.messages.length).toBe(0);
    expect(component.loadingError).toBe(false);
    localStorage.setItem('mockOwmDataServiceError', 'true');
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.loadingError).toBe(true);
      expect(mockHistoryService.messages.length).toBe(0);
      expect(mockErrorsService.messages.length).toBe(1);
    });
  }));
});
