import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ForecastFlexComponent } from './forecast-flex.component';
import { SortCitiesPipe } from '../../pipes/sort-cities.pipe';
import { ConstantsService } from '../../services/constants.service';
import { getNewDataObject } from '../../services/testing.services.mocks';
import { DataCellComponent } from '../data-cell/data-cell.component';
import { AppModule } from 'src/app/app.module';
import { OwmDataUtilsService } from 'src/app/services/owm-data-utils.service';
import { of, throwError } from 'rxjs';

describe('ForecastFlexComponent services', () => {
  let _utils: OwmDataUtilsService;

  let component: ForecastFlexComponent;
  let fixture: ComponentFixture<ForecastFlexComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [AppModule],
        declarations: [ForecastFlexComponent, SortCitiesPipe, DataCellComponent],
        providers: [
          ForecastFlexComponent,
          OwmDataUtilsService,
        ],
      }).compileComponents();
    })
  );

  beforeEach(
    waitForAsync(() => {
      fixture = TestBed.createComponent(ForecastFlexComponent);
      component = fixture.componentInstance;
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

  it('should scrollTodaySlotsInViewport return when no gridContainer', waitForAsync(() => {
    const spyOnAnimateScroll = spyOn(component, 'animateScroll');
    component.gridContainer = null;
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(spyOnAnimateScroll).toHaveBeenCalledTimes(0);
    });
  }));

  it('should scrollTodaySlotsInViewport return when gridContainer scrollWidth === clientWidth', waitForAsync(() => {
    const spyOnAnimateScroll = spyOn(component, 'animateScroll');
    component.gridContainer = {
      nativeElement: {
        scrollWidth: 100,
        clientWidth: 100
      }
    };
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(spyOnAnimateScroll).toHaveBeenCalledTimes(0);
    });
  }));

  it('should scrollTodaySlotsInViewport return when today`s first slot is shown in view', fakeAsync(() => {
    const owmData = getNewDataObject();
    const spyOnUtils = spyOn(_utils, 'getOwmDataDebounced$').and.returnValue(of(owmData));
    const spyOnAnimateScroll = spyOn(component, 'animateScroll');

    fixture.detectChanges();
    tick(ConstantsService.loadingDataDebounceTime_ms);
    const listByDateKeysSorted = Object.keys(component.listByDate).sort();
    const todayKey = listByDateKeysSorted[0];
    const todaySlots = component.listByDate[todayKey];
    const todaySlotsCount = Object.keys(todaySlots).length;
    const maxSlotsPerDay = component.timeTemplate.length;
    component.gridContainer = {
      nativeElement: {
        scrollWidth: 100 * maxSlotsPerDay,
        clientWidth: 100 * (todaySlotsCount + 1)
      }
    };
    component.scrollTodaySlotsInViewport();
    expect(spyOnAnimateScroll).toHaveBeenCalledTimes(0);
  }));

  it('should scrollTodaySlotsInViewport call spyOnAnimateScroll when today`s first slot not in view ', fakeAsync(() => {
    const owmData = getNewDataObject();
    const spyOnUtils = spyOn(_utils, 'getOwmDataDebounced$').and.returnValue(of(owmData));
    const spyOnAnimateScroll = spyOn(component, 'animateScroll');

    fixture.detectChanges();
    tick(ConstantsService.loadingDataDebounceTime_ms);
    const listByDateKeysSorted = Object.keys(component.listByDate).sort();
    const todayKey = listByDateKeysSorted[0];
    const todaySlots = component.listByDate[todayKey];
    const todaySlotsCount = Object.keys(todaySlots).length;
    const maxSlotsPerDay = component.timeTemplate.length;
    component.gridContainer = {
      nativeElement: {
        scrollWidth: 100 * maxSlotsPerDay,
        clientWidth: 100 * todaySlotsCount
      }
    };
    component.scrollTodaySlotsInViewport();
    expect(spyOnAnimateScroll).toHaveBeenCalledTimes(1);
  }));

  it('should animateScroll', fakeAsync(() => {
    const gridContainer = { scrollLeft: 100 };
    const scrollPositions = 5;
    const scrollSlotWidth = 50;
    const initialGridContainerScrollLeft = gridContainer.scrollLeft;
    component.animateScroll(gridContainer, scrollPositions, scrollSlotWidth);
    tick(component.animateScrollRedrawDelay_ms + scrollPositions * component.animateScrollIntervalDelay_ms);
    expect(gridContainer.scrollLeft).toBe(initialGridContainerScrollLeft + scrollPositions * scrollSlotWidth);
  }));

  it('should onMouseWheel return if scrolling', fakeAsync(() => {
    component.scrolling = true;
    const event = {};
    component.gridContainer = { nativeElement: { scrollLeft: 100 } };
    const scrollLeft = component.gridContainer.nativeElement.scrollLeft;
    component.onMouseWheel(event);
    expect(scrollLeft).toBe(component.gridContainer.nativeElement.scrollLeft);
  }));

  it('should onMouseWheel return if event.shiftkey', fakeAsync(() => {
    component.scrolling = false;
    const event = { shiftKey: true };
    component.gridContainer = { nativeElement: { scrollLeft: 100 } };
    const scrollLeft = component.gridContainer.nativeElement.scrollLeft;
    component.onMouseWheel(event);
    expect(scrollLeft).toBe(component.gridContainer.nativeElement.scrollLeft);
  }));

  it('should onMouseWheel return if no gridcontainer', fakeAsync(() => {
    component.scrolling = false;
    const event = {};
    component.gridContainer = null;
    component.onMouseWheel(event);
    expect(component.scrolling).toBe(false);
  }));


  it('should onMouseWheel scrolling', fakeAsync(() => {
    component.scrolling = false;
    const event = { shiftKey: false, deltaY: 50 };
    component.gridContainer = { nativeElement: { scrollLeft: 100 } };
    const scrollLeftInput = component.gridContainer.nativeElement.scrollLeft;
    const step = (event.deltaY * 2) / component.frames;
    
    component.onMouseWheel(event);
    tick(component.onMouseWheelIntervalDelay_ms * (component.frames + 1));
    const scrollLeftOutput = component.gridContainer.nativeElement.scrollLeft;
    expect(scrollLeftOutput).toBe(scrollLeftInput + (component.frames + 1) * step);
  }));
  
  it('should addError', () => {
    const spyOnErrorsAdd = spyOn(component['_errors'], 'add');
    component.addError('custom error string', 'error message');
    expect(spyOnErrorsAdd).toHaveBeenCalledTimes(1);
  });

  it('should showDataCellExpanded', () => {
    const spyOnDialogOpen = spyOn(component.dialog, 'open');
    component.showDataCellExpanded({}, 'bgColor string');
    expect(spyOnDialogOpen).toHaveBeenCalledTimes(1);
  });

  it('should showDataCellExpanded return when no timeslot', () => {
    const spyOnDialogOpen = spyOn(component.dialog, 'open');
    component.showDataCellExpanded(null, 'bgColor string');
    expect(spyOnDialogOpen).toHaveBeenCalledTimes(0);
  });

});
