import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { AppModule } from 'src/app/app.module';
import { GoogleChartsModule } from 'angular-google-charts';
import { OwmDataUtilsService } from 'src/app/services/owm-data-utils.service';
import { of, Subscription } from 'rxjs';

import { ForecastGchartLegendComponent } from '../../components/forecast-gchart-legend/forecast-gchart-legend.component';
import { ForecastGChartComponent } from './forecast-gchart.component';
import { ConstantsService } from '../../services/constants.service';
import { getNewDataObject } from '../../services/testing.services.mocks';
import { WindowRefService } from '../../services/window.service';

describe('ForecastGChartComponent services', () => {
  let _utils: OwmDataUtilsService;

  let component: ForecastGChartComponent;
  let fixture: ComponentFixture<ForecastGChartComponent>;
  let debugElement: DebugElement;
  let windowRef: any;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ForecastGChartComponent, ForecastGchartLegendComponent],
        imports: [AppModule, GoogleChartsModule.forRoot()],
        providers: [
          ForecastGChartComponent,
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
      windowRef = TestBed.inject(WindowRefService);
    })
  );

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it(
    'should subscribeResizeObservable',
    waitForAsync(() => {
      component.resizeWindow$ = of(true);
      const spyOnResizeCharts = spyOn(component, 'resizeCharts');

      component.activeDays = [];
      component.subscribeResizeWindow();
      expect(spyOnResizeCharts).toHaveBeenCalledTimes(0);

      component.activeDays = ['test_day_key'];
      component.subscribeResizeWindow();
      expect(spyOnResizeCharts).toHaveBeenCalledTimes(1);
    })
  );

  it(
    'should subscribeLayoutChangesOrientation',
    waitForAsync(() => {
      component.layoutChangesOrientation$ = of(true) as any;
      const spyOnResizeCharts = spyOn(component, 'resizeCharts');

      component.subscriptions = new Subscription();
      component.activeDays = [];
      component.subscribeLayoutChangesOrientation();
      expect(spyOnResizeCharts).toHaveBeenCalledTimes(0);

      component.subscriptions.unsubscribe();
      component.subscriptions = new Subscription();
      component.activeDays = ['test_day_key'];
      component.subscribeLayoutChangesOrientation();
      expect(spyOnResizeCharts).toHaveBeenCalledTimes(1);
    })
  );

  it(
    'should subscribeDaysForecast',
    waitForAsync(() => {
      const spyOnDaysForecast$ = spyOnProperty(component, 'daysForecast$').and.returnValue(of(true) as any);
      const spyOnResizeCharts = spyOn(component, 'resizeCharts');

      component.subscriptions = new Subscription();
      component.activeDays = [];
      component.subscribeDaysForecast();
      expect(spyOnResizeCharts).toHaveBeenCalledTimes(0);

      component.subscriptions.unsubscribe();
      component.subscriptions = new Subscription();
      component.activeDays = ['test_day_key'];
      component.subscribeDaysForecast();
      expect(spyOnResizeCharts).toHaveBeenCalledTimes(1);
    })
  );

  it(
    'should subscribeDaysForecast',
    waitForAsync(() => {
      const spyOnDaysForecast$ = spyOnProperty(component, 'daysForecast$').and.returnValue(of(true) as any);
      const spyOnResizeCharts = spyOn(component, 'resizeCharts');

      component.subscriptions = new Subscription();
      component.activeDays = [];
      component.subscribeDaysForecast();
      expect(spyOnResizeCharts).toHaveBeenCalledTimes(0);

      component.subscriptions.unsubscribe();
      component.subscriptions = new Subscription();
      component.activeDays = ['test_day_key'];
      component.subscribeDaysForecast();
      expect(spyOnResizeCharts).toHaveBeenCalledTimes(1);
    })
  );

  it('should setDebounceIconsDraws', fakeAsync(() => {
    const spyOnRedrawOverlay = spyOn(component, 'redrawOverlay');
    fixture.detectChanges();
    [...Array(6)].forEach((_, index) => {
      component.overlaySubjecs[index].next(true);
    });
    tick(ConstantsService.gchartIconsShowDelay_ms);
    expect(spyOnRedrawOverlay).toHaveBeenCalledTimes(6);
  }));

  it(
    'should subscribeOwmData',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const spyOnUtils = spyOn(_utils, 'getOwmDataDebounced$').and.returnValue(of(owmData));
      const spyOnShowGChartWind$ = spyOnProperty(component, 'showGChartWind$').and.returnValue(of(true));
      const spyOnShowGChartHumidity$ = spyOnProperty(component, 'showGChartHumidity$').and.returnValue(of(true));
      const spyOnUpdateKeysAndData = spyOn(component, 'updateKeysAndData');
      component.subscriptions = new Subscription();
      component.subscribeOwmData();
      expect(spyOnUtils).toHaveBeenCalledTimes(1);
      expect(spyOnUpdateKeysAndData).toHaveBeenCalledTimes(1);
    })
  );

  it('should updateKeysAndData when activeDays.lenght != 1', () => {
    const owmData = getNewDataObject();
    const spyOnSetGChartData = spyOn(component['_populateGchartData'], 'setGChartData').and.returnValue({});
    const spyOnResizeCharts = spyOn(component, 'resizeCharts');

    component.updateKeysAndData([owmData, true, true]);
    expect(spyOnResizeCharts).toHaveBeenCalledTimes(1);
    expect(spyOnSetGChartData).toHaveBeenCalledTimes(1);
  });

  it('should updateKeysAndData when activeDays.lenght = 1', () => {
    const owmData = getNewDataObject();
    const spyOnSetGChartData = spyOn(component['_populateGchartData'], 'setGChartData').and.returnValue({});
    const spyOnResizeCharts = spyOn(component, 'resizeCharts');

    component.updateKeysAndData([owmData, true, true]);
    component.activeDays = [component.activeDays[0]];
    component.updateKeysAndData([owmData, true, true]);

    expect(spyOnResizeCharts).toHaveBeenCalledTimes(2);
    expect(spyOnSetGChartData).toHaveBeenCalledTimes(2);
  });

  it('should updateKeysAndData when activeDays.lenght=1 and activeDays is newly updated', () => {
    const owmData = getNewDataObject();
    const spyOnSetGChartData = spyOn(component['_populateGchartData'], 'setGChartData').and.returnValue({});
    const spyOnResizeCharts = spyOn(component, 'resizeCharts');

    component.updateKeysAndData([owmData, true, true]);
    component.activeDays = [component.activeDays[0].split('').reverse().join()];
    component.updateKeysAndData([owmData, true, true]);
    expect(spyOnResizeCharts).toHaveBeenCalledTimes(2);
    expect(spyOnSetGChartData).toHaveBeenCalledTimes(2);
  });

  it('should clickedDay', () => {
    const spyOnResizeCharts = spyOn(component, 'resizeCharts');
    const weatherDataDateKeys = ['k1', 'k2', 'k3', 'k4', 'k5'];
    const activeDays = ['k1', 'k2', 'k3', 'k4', 'k5'];
    const selectedDay = 'k2';
    component.weatherDataDateKeys = weatherDataDateKeys;
    component.activeDays = activeDays;

    component.clickedDay(selectedDay);
    expect(spyOnResizeCharts).toHaveBeenCalledTimes(1);
    expect(component.activeDays).toEqual([selectedDay]);
  });

  it('should clickedDay active days = 1', () => {
    const spyOnResizeCharts = spyOn(component, 'resizeCharts');
    const weatherDataDateKeys = ['k1', 'k2', 'k3', 'k4', 'k5'];
    const activeDays = ['k2'];
    const selectedDay = 'k2';
    component.weatherDataDateKeys = weatherDataDateKeys;
    component.activeDays = activeDays;

    component.clickedDay(selectedDay);
    expect(spyOnResizeCharts).toHaveBeenCalledTimes(1);
    expect(component.activeDays).toEqual(weatherDataDateKeys);
  });

  it('should resizeCharts no dateColumn', () => {
    const activeDays = ['1234567890', '1234567891'];
    component.dateColumn = null;
    component.activeDays = activeDays;
    component.chart[activeDays[0]] = {};
    component.chart[activeDays[1]] = {};

    component.resizeCharts(activeDays);
    expect(component.chart[activeDays[0]].height).toBeUndefined();
    expect(component.chart[activeDays[1]].height).toBeUndefined();
  });

  it('should resizeCharts active days = 1', () => {
    const weatherDataDateKeys = ['1234567890', '1234567891', '1234567892'];
    const activeDays = ['1234567890'];
    component.chart[activeDays[0]] = {};
    component.weatherDataDateKeys = weatherDataDateKeys;
    component.activeDays = activeDays;

    component.resizeCharts(activeDays);
    expect(component.chart[activeDays[0]].height).toBeDefined();
  });

  it('should resizeCharts using dateColumn height', () => {
    const dateColumn: any = {
      nativeElement: {
        clientHeight: 500,
      },
    };
    component.dateColumn = dateColumn;
    windowRef.nativeWindow.innerHeight = 500;
    const weatherDataDateKeys = ['1234567890', '1234567891', '1234567892'];
    const activeDays = ['1234567890', '1234567891'];
    component.chart[activeDays[0]] = {};
    component.chart[activeDays[1]] = {};
    component.weatherDataDateKeys = weatherDataDateKeys;
    component.activeDays = activeDays;

    component.resizeCharts(activeDays);
    expect(component.chart[activeDays[0]].height).toBeDefined();
    expect(component.chart[activeDays[1]].height).toBeDefined();
  });

  it('should resizeCharts using window innerHeight', () => {
    const dateColumn: any = {
      nativeElement: {
        clientHeight: undefined,
      },
    };
    component.dateColumn = dateColumn;
    windowRef.nativeWindow.innerHeight = 500;

    const weatherDataDateKeys = ['1234567890', '1234567891', '1234567892'];
    const activeDays = ['1234567890', '1234567891'];
    component.chart[activeDays[0]] = {};
    component.chart[activeDays[1]] = {};
    component.weatherDataDateKeys = weatherDataDateKeys;
    component.activeDays = activeDays;

    component.resizeCharts(activeDays);
    expect(component.chart[activeDays[0]].height).toBeDefined();
    expect(component.chart[activeDays[1]].height).toBeDefined();
  });

  it('should onReady return ', () => {
    let event: any;
    const gc = null;
    const overlay = null;
    const overlayContent = null;
    const ind = 0;
    fixture.detectChanges();
    const spyOnOverlaySubjects = spyOn(component.overlaySubjecs[0], 'next');

    component.onReady(event, gc, overlay, overlayContent, ind);
    expect(spyOnOverlaySubjects).toHaveBeenCalledTimes(0);
  });

  it(
    'should onReady call [ind].next() when activedays.length != 1',
    waitForAsync(() => {
      const activeDays = ['1234567890', '1234567891', '1234567892'];
      component.activeDays = activeDays;
      let event: any;
      const gc = {};
      const overlay = {};
      const overlayContent = { setAttribute: function (attr, value) {} };
      const ind = 2;

      component.subscriptions = new Subscription();
      component.setDebounceIconsDraws();
      const spyOnOverlaySubjects = spyOn(component.overlaySubjecs[2], 'next');

      component.onReady(event, gc, overlay, overlayContent, ind);
      expect(spyOnOverlaySubjects).toHaveBeenCalledTimes(1);
    })
  );

  it(
    'should onReady call [5].next() when activedays.length = 1',
    waitForAsync(() => {
      const activeDays = ['1234567892'];
      component.activeDays = activeDays;
      let event: any;
      const gc = {};
      const overlay = {};
      const overlayContent = { setAttribute: function (attr, value) {} };
      const ind = 2;

      component.subscriptions = new Subscription();
      component.setDebounceIconsDraws();
      const spyOnOverlaySubjects = spyOn(component.overlaySubjecs[5], 'next');

      component.onReady(event, gc, overlay, overlayContent, ind);
      expect(spyOnOverlaySubjects).toHaveBeenCalledTimes(1);
    })
  );

  it('should redrawOverlay from getChartAreaBoundingBox', () => {
      const activeDays = ['1234567892'];
      component.activeDays = activeDays;
      let event: any;
      const gc = {
        height: 500,
        width: 1000,
        chart: {
          getChartLayoutInterface: function () {
            return {
              getChartAreaBoundingBox: function () {
                return {
                  left: 100,
                  width: 500
                }
              },
            };
          },
        },
      };

      const overlay = {
        style: '',
        setAttribute: function (attr, value) {
          this[attr] = value;
        } 
      };
      const overlayContent = { 
        style: '',
        setAttribute: function (attr, value) {
          this[attr] = value;
        } 
      };

      component.redrawOverlay({ gc, overlay, overlayContent, extendedIndex: 5 });
      expect(overlayContent.style).toContain('left');
      expect(overlay.style).toContain('top');
    }
  );

  it('should redrawOverlay from google chart when getChartAreaBoundingBox throws an error', () => {
      const activeDays = ['1234567892'];
      component.activeDays = activeDays;
      const gc = {
        height: 500,
        width: 1000,
        chart: {
          getChartLayoutInterface: function () {
            return {
              getChartAreaBoundingBox: function () {
                throw 'TEST getChartAreaBoundingBox error'
              },
            };
          },
        },
      };
      const overlay = {
        style: '',
        setAttribute: function (attr, value) {
          this[attr] = value;
        } 
      };
      const overlayContent = { 
        style: '',
        setAttribute: function (attr, value) {
          this[attr] = value;
        } 
      };

      component.redrawOverlay({ gc, overlay, overlayContent, extendedIndex: 5 });
      expect(overlayContent.style).toContain('left');
      expect(overlay.style).toContain('top');
    }
  );

  it('should showDataCellExpanded when index!=0 ', () => {
    const owmData = getNewDataObject();
    const timeSlotData = owmData.list[0];
    const spyOnDialogOpen = spyOn(component['dialog'], 'open')

    component.showDataCellExpanded(timeSlotData, 1);
    expect(spyOnDialogOpen).toHaveBeenCalledTimes(1);
  });

  it('should showDataCellExpanded when index=0', () => {
    const owmData = getNewDataObject();
    const timeSlotData = owmData.list[0];
    const spyOnDialogOpen = spyOn(component['dialog'], 'open')

    component.showDataCellExpanded(timeSlotData, 0);
    expect(spyOnDialogOpen).toHaveBeenCalledTimes(1);
  });

  it('should showDataCellExpanded return on guards', () => {
    const spyOnDialogOpen = spyOn(component['dialog'], 'open')

    component.showDataCellExpanded(null, undefined);
    expect(spyOnDialogOpen).toHaveBeenCalledTimes(0);
  });

  it('should addError', () => {
    const spyOnErrorsAdd = spyOn(component['_errors'], 'add');
    component.addError('custom error string', 'error message');
    expect(spyOnErrorsAdd).toHaveBeenCalledTimes(1);
  });


});
