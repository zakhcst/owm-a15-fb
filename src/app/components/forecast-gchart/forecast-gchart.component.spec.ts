import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequiredModules } from '../../modules/required.module';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

import { ForecastGChartComponent } from './forecast-gchart.component';
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

  let component: ForecastGChartComponent;
  let fixture: ComponentFixture<ForecastGChartComponent>;
  let debugElement: DebugElement;

  function resetLocalStorage() {
    localStorage.removeItem('mockGetBrowserIpServiceError');
    localStorage.removeItem('mockOwmStatsServiceError');
    localStorage.removeItem('mockCitiesServiceError');
    localStorage.removeItem('mockOwmDataServiceError');
    localStorage.removeItem('mockIp');
  }

  beforeEach(async(() => {
    mockOwmDataService = new MockOwmDataService();
    // mockGetBrowserIpService = new MockGetBrowserIpService();
    // mockOwmStatsService = new MockOwmStatsService();
    // mockCitiesService = new MockCitiesService();
    mockHistoryService = new MockHistoryService();
    mockErrorsService = new MockErrorsService();
    TestBed.configureTestingModule({
      declarations: [
        ForecastGChartComponent,
        AppSnackBarInnerComponent,
        SortCitiesPipe
      ],
      imports: [RequiredModules],
      providers: [
        ForecastGChartComponent,
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

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ForecastGChartComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    resetLocalStorage();
  }));

  afterEach(() => {
    resetLocalStorage();
  });

  it('should have all async data', async(() => {
    owmDataService = debugElement.injector.get(OwmDataManagerService);

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


  it('should get stats from OwmStatsService', async(() => {
    const stats = { r: 1000, u: 1000 };
    localStorage.setItem('mockOwmStatsService', JSON.stringify(stats));
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      // expect(component.stats).toEqual(stats);
      expect(mockHistoryService.messages.length).toBe(1);
      expect(mockErrorsService.messages.length).toBe(0);
    });
  }));

  it('should add error on failing service OwmStatsService', async(() => {
    expect(mockHistoryService.messages.length).toBe(0);
    expect(mockErrorsService.messages.length).toBe(0);
    localStorage.setItem('mockOwmStatsServiceError', 'true');
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(mockHistoryService.messages.length).toBe(1);
      expect(mockErrorsService.messages.length).toBe(1);
    });
  }));

  it('should get cities from CitiesService', async(() => {
    expect(mockErrorsService.messages.length).toBe(0);
    expect(mockHistoryService.messages.length).toBe(0);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(mockHistoryService.messages.length).toBe(1);
      expect(mockErrorsService.messages.length).toBe(0);
    });
  }));

  it('should add error on failing service CitiesService', async(() => {
    expect(mockErrorsService.messages.length).toBe(0);
    expect(mockHistoryService.messages.length).toBe(0);
    localStorage.setItem('mockCitiesServiceError', 'true');
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(mockHistoryService.messages.length).toBe(0);
      expect(mockErrorsService.messages.length).toBe(1);
    });
  }));

  it('should get data from OwmDataService', async(() => {
    expect(mockErrorsService.messages.length).toBe(0);
    expect(mockHistoryService.messages.length).toBe(0);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.weatherData).toEqual(getNewDataObject());
      expect(mockHistoryService.messages.length).toBe(1);
      expect(mockErrorsService.messages.length).toBe(0);
    });
  }));

  it('should add error on failing service OwmDataService', async(() => {
    expect(mockErrorsService.messages.length).toBe(0);
    expect(mockHistoryService.messages.length).toBe(0);
    localStorage.setItem('mockOwmDataServiceError', 'true');
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(mockHistoryService.messages.length).toBe(0);
      expect(mockErrorsService.messages.length).toBe(1);
    });
  }));
});
