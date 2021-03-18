import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { AppModule } from 'src/app/app.module';
import { GoogleChartsModule } from 'angular-google-charts';
import { OwmDataUtilsService } from 'src/app/services/owm-data-utils.service';
import { of, throwError } from 'rxjs';

import { ForecastGchartLegendComponent } from '../../components/forecast-gchart-legend/forecast-gchart-legend.component';
import { ForecastGChartComponent } from './forecast-gchart.component';
import { ErrorsService } from '../../services/errors.service';
import { MockErrorsService, getNewDataObject } from '../../services/testing.services.mocks';

describe('ForecastGChartComponent services', () => {
  let mockErrorsService: MockErrorsService;
  let _utils: OwmDataUtilsService;

  let component: ForecastGChartComponent;
  let fixture: ComponentFixture<ForecastGChartComponent>;
  let debugElement: DebugElement;

  beforeEach(
    waitForAsync(() => {
      mockErrorsService = new MockErrorsService();
      TestBed.configureTestingModule({
        declarations: [ForecastGChartComponent, ForecastGchartLegendComponent],
        imports: [AppModule, GoogleChartsModule.forRoot()],
        providers: [
          ForecastGChartComponent,
          { provide: ErrorsService, useValue: mockErrorsService },
          OwmDataUtilsService,
        ],
      }).compileComponents();
    })
  );

  beforeEach(
    waitForAsync(() => {
      fixture = TestBed.createComponent(ForecastGChartComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      _utils = TestBed.inject(OwmDataUtilsService);
    })
  );

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it(
    'should get data from getOwmDataDebounced$',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const spyOnUtils = spyOn(_utils, 'getOwmDataDebounced$').and.returnValue(of(owmData));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(spyOnUtils).toHaveBeenCalledTimes(1);
        expect(component.weatherData).toEqual(owmData);
      });
    })
  );

  it(
    'should get error from getOwmDataDebounced$',
    waitForAsync(() => {
      const errMessage = 'getOwmDataDebounced$ error';
      const spyOnUtils = spyOn(_utils, 'getOwmDataDebounced$').and.returnValue(throwError(new Error(errMessage)));
      const spyAddErrors = spyOn(component, 'addError');

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.weatherData).toBeFalsy();
        expect(spyOnUtils).toHaveBeenCalledTimes(1);
        expect(spyAddErrors).toHaveBeenCalledTimes(1);
        expect(spyAddErrors).toHaveBeenCalledWith('ngOnInit: onChange: subscribe', errMessage);
      });
    })
  );
});
