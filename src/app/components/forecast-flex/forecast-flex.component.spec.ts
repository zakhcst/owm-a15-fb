import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

import { ForecastFlexComponent } from './forecast-flex.component';
import { AppSnackBarInnerComponent } from '../app-snack-bar-inner/app-snack-bar-inner.component';
import { SortCitiesPipe } from '../../pipes/sort-cities.pipe';

import { OwmDataManagerService } from '../../services/owm-data-manager.service';
import { ErrorsService } from '../../services/errors.service';

import {
  MockOwmDataService,
  MockHistoryService,
  MockErrorsService,
  getNewDataObject,
} from '../../services/testing.services.mocks';
import { DebugElement } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DataCellComponent } from '../data-cell/data-cell.component';
import { AppModule } from 'src/app/app.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ForecastFlexComponent services', () => {
  let mockOwmDataService: MockOwmDataService;
  let mockErrorsService: MockErrorsService;

  let owmDataService: OwmDataManagerService;
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

  beforeEach(
    waitForAsync(() => {
      mockOwmDataService = new MockOwmDataService();
      mockErrorsService = new MockErrorsService();
      TestBed.configureTestingModule({
        imports: [AppModule],
        declarations: [ForecastFlexComponent, SortCitiesPipe, DataCellComponent],
        providers: [
          ForecastFlexComponent,
          MatSnackBarModule,
          { provide: OwmDataManagerService, useValue: mockOwmDataService },
          { provide: ErrorsService, useValue: mockErrorsService },
        ],
      })
        // .overrideModule(BrowserDynamicTestingModule, {
        //   set: {
        //     entryComponents: [AppSnackBarInnerComponent],
        //   },
        // })
        .compileComponents();
    })
  );

  beforeEach(
    waitForAsync(() => {
      resetLocalStorage();
      fixture = TestBed.createComponent(ForecastFlexComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
    })
  );

  afterEach(() => {
    resetLocalStorage();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should have all async data', waitForAsync(() => {
      owmDataService = TestBed.inject(OwmDataManagerService);
      errorsService = TestBed.inject(ErrorsService);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.weatherData).toBeTruthy('component.weatherData');

        expect(component.loadingOwmData).toBe(false);
        expect(component).toBeTruthy('expect(component)');
        expect(owmDataService).toBeTruthy('expect(owmDataService)');
        expect(errorsService).toBeTruthy('expect(errorsService)');
      });
    })
  );

  it('should get data from OwmDataService', waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.weatherData).toEqual(getNewDataObject());
      });
    })
  );

});
