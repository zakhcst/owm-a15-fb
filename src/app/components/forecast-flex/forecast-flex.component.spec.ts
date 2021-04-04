import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ForecastFlexComponent } from './forecast-flex.component';
import { SortCitiesPipe } from '../../pipes/sort-cities.pipe';
import { ErrorsService } from '../../services/errors.service';
import { MockErrorsService, getNewDataObject } from '../../services/testing.services.mocks';
import { DebugElement } from '@angular/core';
import { DataCellComponent } from '../data-cell/data-cell.component';
import { AppModule } from 'src/app/app.module';
import { OwmDataUtilsService } from 'src/app/services/owm-data-utils.service';
import { of, throwError } from 'rxjs';

describe('ForecastFlexComponent services', () => {
  let mockErrorsService: MockErrorsService;
  let _utils: OwmDataUtilsService;

  let component: ForecastFlexComponent;
  let fixture: ComponentFixture<ForecastFlexComponent>;
  let debugElement: DebugElement;

  beforeEach(
    waitForAsync(() => {
      mockErrorsService = new MockErrorsService();
      TestBed.configureTestingModule({
        imports: [AppModule],
        declarations: [ForecastFlexComponent, SortCitiesPipe, DataCellComponent],
        providers: [
          ForecastFlexComponent,
          { provide: ErrorsService, useValue: mockErrorsService },
          OwmDataUtilsService,
        ],
      }).compileComponents();
    })
  );

  beforeEach(
    waitForAsync(() => {
      fixture = TestBed.createComponent(ForecastFlexComponent);
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
      const owmData = getNewDataObject();
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
  
  it(
    'scrollTodaySlotsInViewport should return when no gridContainer',
    waitForAsync(() => {
      const spyOnAnimateScroll = spyOn(component, 'animateScroll');
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(spyOnAnimateScroll).toHaveBeenCalledTimes(0);
      });
    })
  );

});
