import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RequiredModules } from '../../modules/required.module';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

import { ForecastGChartComponent } from './forecast-gchart.component';
import { AppSnackBarInnerComponent } from '../app-snack-bar-inner/app-snack-bar-inner.component';
import { SortCitiesPipe } from '../../pipes/sort-cities.pipe';

import { OwmDataManagerService } from '../../services/owm-data-manager.service';
import { ErrorsService } from '../../services/errors.service';

import {
  MockOwmDataService,
  MockErrorsService,
  getNewDataObject,
} from '../../services/testing.services.mocks';
import { DebugElement } from '@angular/core';
import { AppModule } from 'src/app/app.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { GoogleChartsModule } from 'angular-google-charts';
import { SnackbarService } from '../../services/snackbar.service';
import { ForecastGchartLegendComponent } from '../../components/forecast-gchart-legend/forecast-gchart-legend.component';

describe('ForecastGChartComponent services', () => {
  let mockOwmDataService: MockOwmDataService;
  let mockErrorsService: MockErrorsService;

  let owmDataService: OwmDataManagerService;
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

  beforeEach(waitForAsync(() => {
    mockOwmDataService = new MockOwmDataService();
    mockErrorsService = new MockErrorsService();
    TestBed.configureTestingModule({
      declarations: [
        ForecastGChartComponent,
        ForecastGchartLegendComponent,
        AppSnackBarInnerComponent,
        SortCitiesPipe
      ],
      imports: [AppModule, RequiredModules, GoogleChartsModule.forRoot()],
      providers: [
        MatSnackBarModule,
        ForecastGChartComponent,
        SnackbarService,
        { provide: OwmDataManagerService, useValue: mockOwmDataService },
        { provide: ErrorsService, useValue: mockErrorsService },
      ]
    })
      // .overrideModule(BrowserDynamicTestingModule, {
      //   set: {
      //     entryComponents: [AppSnackBarInnerComponent]
      //   }
      // })
      .compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ForecastGChartComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    resetLocalStorage();
  }));

  afterEach(() => {
    resetLocalStorage();
  });

  it('should get data from OwmDataService', waitForAsync(() => {
    expect(mockErrorsService.messages.length).toBe(0);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.weatherData).toEqual(getNewDataObject());
      expect(mockErrorsService.messages.length).toBe(0);
    });
  }));

});
