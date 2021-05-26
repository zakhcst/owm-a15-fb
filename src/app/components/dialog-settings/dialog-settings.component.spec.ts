import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DialogSettingsComponent } from './dialog-settings.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { AppRoutingModule } from 'src/app/modules/routing.module';
import { ConstantsService } from 'src/app/services/constants.service';
import { SharedModule } from 'src/app/modules/shared.module';
import { RequiredModules } from 'src/app/modules/required.module';
import { InitModules } from 'src/app/modules/init.module';
import { Router } from '@angular/router';
import { AdditionalModules } from 'src/app/modules/additional.module';
import { By } from '@angular/platform-browser';
import { PopupType } from 'src/app/models/snackbar.model';

export class MatDialogRefMock {
  close() {}
  open() {}
  updatePosition() {}
  updateSize() {}
}

describe('DialogSettingsComponent', () => {
  class DataParams {
    currentPageKey = pagesKeys[0];
    nativeElement = {
      offsetLeft: 500,
      offsetWidth: 300,
      offsetTop: 10,
    };
    _elementRef = { nativeElement: { ...this.nativeElement } };
    settingsButton = { _elementRef: this._elementRef };
    width = ConstantsService.settingsDialogConfig.width;
    positionTop = ConstantsService.settingsDialogConfig.positionTop;
    margin = ConstantsService.settingsDialogConfig.margin;
    collapsibleHeight = 0;
    mediaObserver = {
      isActive: () => true,
    };
  }
  
  const pagesKeys = [...Object.keys(ConstantsService.toolbar)];

  let router: Router;
  let store: Store;
  let component: DialogSettingsComponent;
  let fixture: ComponentFixture<DialogSettingsComponent>;
  let spyOnStoreSelectSnapshot;
  let data;

  function setComponent(pageKeyIndex) {
    data.currentPageKey = pagesKeys[pageKeyIndex];
    data.collapsibleHeight = ConstantsService.toolbar[pagesKeys[pageKeyIndex]].settingsDialog.collapsibleHeight;
    fixture = TestBed.createComponent(DialogSettingsComponent);
    component = fixture.componentInstance;
    spyOnStoreSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValues(
      true,
      true,
      true,
      5,
      true,
      true,
      true,
      true,
      true,
      true
    );
    fixture.detectChanges();
  }

  beforeEach(
    waitForAsync(() => {
      data = new DataParams();
      TestBed.configureTestingModule({
        imports: [InitModules, RequiredModules, AppRoutingModule, SharedModule, AdditionalModules],
        declarations: [DialogSettingsComponent],
        providers: [
          Store,
          DialogSettingsComponent,
          { provide: MAT_DIALOG_DATA, useValue: data },
          { provide: MatDialogRef, useClass: MatDialogRefMock },
        ],
      }).compileComponents();
      router = TestBed.inject(Router);
      store = TestBed.inject(Store);
    })
  );

  it('should DialogSettingsComponent be defined', () => {
    setComponent(0);
    expect(component).toBeDefined();
  });

  it('should DialogSettingsComponent get snapshots', () => {
    setComponent(0);
    expect(spyOnStoreSelectSnapshot).toHaveBeenCalledTimes(10);
  });

  it('should display DialogSettingsComponent when page index 0', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);

    const selectableElements = fixture.debugElement.query(By.css('.dialog-settings-container .grid')).nativeElement
      .children;
    const toolbarElementsSettingsOptions = ConstantsService.toolbar[pagesKeys[pageKeyIndex]].settingsOptions;
    const toolbarElementsSettingsOptionsLength = Object.keys(toolbarElementsSettingsOptions).length;
    expect(selectableElements.length).toBe(toolbarElementsSettingsOptionsLength);
  });

  it('should display DialogSettingsComponent when page index 1', () => {
    const pageKeyIndex = 1;
    setComponent(pageKeyIndex);

    const selectableElements = fixture.debugElement.query(By.css('.dialog-settings-container .grid')).nativeElement
      .children;
    const toolbarElementsSettingsOptions = ConstantsService.toolbar[pagesKeys[pageKeyIndex]].settingsOptions;
    const toolbarElementsSettingsOptionsLength = Object.keys(toolbarElementsSettingsOptions).length;
    expect(selectableElements.length).toBe(toolbarElementsSettingsOptionsLength);
  });

  it('should display DialogSettingsComponent when page index 2', () => {
    const pageKeyIndex = 2;
    setComponent(pageKeyIndex);

    const selectableElements = fixture.debugElement.query(By.css('.dialog-settings-container .grid')).nativeElement
      .children;
    const toolbarElementsSettingsOptions = ConstantsService.toolbar[pagesKeys[pageKeyIndex]].settingsOptions;
    const toolbarElementsSettingsOptionsLength = Object.keys(toolbarElementsSettingsOptions).length;
    expect(selectableElements.length).toBe(toolbarElementsSettingsOptionsLength);
  });

  it('should toggleLiveDataUpdate ', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);

    const liveDataUpdate = component.liveDataUpdate;
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    component.toggleLiveDataUpdate();
    fixture.detectChanges();
    const toggledLiveDataUpdate = component.liveDataUpdate;
    expect(!liveDataUpdate).toBe(toggledLiveDataUpdate);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
  });

  it('should togglePopupType ', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);

    let popupType: PopupType, toggledPopupType: PopupType;
    component.popupType = PopupType.TOAST;
    popupType = component.popupType;
    const spyOnStoreDispatch = spyOn(store, 'dispatch');

    component.togglePopupType();
    fixture.detectChanges();
    toggledPopupType = component.popupType;
    expect(toggledPopupType !== popupType).toBe(true);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);

    component.popupType = PopupType.SNACKBAR;
    popupType = component.popupType;

    component.togglePopupType();
    fixture.detectChanges();
    expect(component.popupType !== popupType).toBe(true);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(2);
  });

  it('should updateDaysForecast ', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);
    const spyOnStoreDispatch = spyOn(store, 'dispatch');

    fixture.detectChanges();
    const daysForecast = component.daysForecast;
    expect(daysForecast).toBeDefined();
    expect(typeof daysForecast).toBe('number');
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(0);

    component.daysForecast = component.daysForecast === 3 ? 5 : 3;
    component.updateDaysForecast();
    expect(component.daysForecast).toBe(component.daysForecastPrevious);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);

    component.daysForecast = component.daysForecast === 5 ? 3 : 5;
    component.updateDaysForecast();
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(2);

    component.updateDaysForecast();
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(2);
  });

  it('should toggleShowTimeSlotBgPicture ', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);

    const showDetailTimeSlotBgPicture = component.showDetailTimeSlotBgPicture;
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    component.toggleShowTimeSlotBgPicture();
    fixture.detectChanges();
    expect(!showDetailTimeSlotBgPicture).toBe(component.showDetailTimeSlotBgPicture);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
  });

  it('should toggleShowDetailPressure ', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);

    const showDetailPressure = component.showDetailPressure;
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    component.toggleShowDetailPressure();
    fixture.detectChanges();
    expect(!showDetailPressure).toBe(component.showDetailPressure);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
  });

  it('should toggleShowDetailWind ', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);

    const showDetailWind = component.showDetailWind;
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    component.toggleShowDetailWind();
    fixture.detectChanges();
    expect(!showDetailWind).toBe(component.showDetailWind);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
  });

  it('should toggleShowDetailHumidity', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);

    const showDetailHumidity = component.showDetailHumidity;
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    component.toggleShowDetailHumidity();
    fixture.detectChanges();
    expect(!showDetailHumidity).toBe(component.showDetailHumidity);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
  });

  it('should toggleShowGChartWind', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);

    const showGChartWind = component.showGChartWind;
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    component.toggleShowGChartWind();
    fixture.detectChanges();
    expect(!showGChartWind).toBe(component.showGChartWind);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
  });

  it('should toggleShowGChartHumidity', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);

    const showGChartHumidity = component.showGChartHumidity;
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    component.toggleShowGChartHumidity();
    fixture.detectChanges();
    expect(!showGChartHumidity).toBe(component.showGChartHumidity);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
  });

  it('should toggleShowGChartIcons', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);

    const showGChartIcons = component.showGChartIcons;
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    component.toggleShowGChartIcons();
    fixture.detectChanges();
    expect(!showGChartIcons).toBe(component.showGChartIcons);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
  });

  it('should checkButtonVisibility call closeDialog', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);
    let spyOnCloseDialog = spyOn(component, 'closeDialog').and.returnValue();

    data.settingsButton._elementRef.nativeElement.offsetTop = null;
    component.checkButtonVisibility();
    expect(spyOnCloseDialog).toHaveBeenCalledTimes(1);

    data.settingsButton._elementRef.nativeElement.offsetTop = 100;
    component.checkButtonVisibility();
    expect(spyOnCloseDialog).toHaveBeenCalledTimes(1);

    component.closeDialog();
    expect(spyOnCloseDialog).toHaveBeenCalledTimes(2);
  });

  it('should closeDialog', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);
    let spyOnCloseDialog = spyOn(component.dialogRef, 'close');

    component.closeDialog();
    expect(spyOnCloseDialog).toHaveBeenCalledTimes(1);
  });

  it('should onResize', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);
    let spyOnResize = spyOn(component, 'reposition');

    component.onResize();
    expect(spyOnResize).toHaveBeenCalledTimes(1);
  });

  it('should dialogHeight', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);
    const windowHeight = window.innerHeight;

    component.data.collapsibleHeight = windowHeight + 100;
    expect(component.dialogHeight).toContain('px');
    component.data.collapsibleHeight = windowHeight - 100;
    expect(component.dialogHeight).toContain('auto');
  });

  it('should get dialogPositionLeft', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);
    const offsetLeft = component.data.settingsButton._elementRef.nativeElement.offsetLeft;
    const offsetWidth = component.data.settingsButton._elementRef.nativeElement.offsetWidth;
    const width = component.data.width + 10;
    const spyOnIsXs = spyOn(component.data.mediaObserver, 'isActive').and.returnValues(true, false);
    fixture.detectChanges();
    expect(component.dialogPositionLeft).toBe(offsetLeft + offsetWidth + 10);
    expect(component.dialogPositionLeft).toBe(offsetLeft - width);
    expect(spyOnIsXs).toHaveBeenCalledTimes(2);
  });

  it('should get dialogPositionLeft no offset', () => {
    const pageKeyIndex = 0;
    setComponent(pageKeyIndex);
    component.data.settingsButton._elementRef.nativeElement.offsetLeft = 0;
    fixture.detectChanges();
    const offsetLeft = document.body.clientWidth;
    const offsetWidth = component.data.settingsButton._elementRef.nativeElement.offsetWidth;
    const width = component.data.width + 10;
    const spyOnIsXs = spyOn(component.data.mediaObserver, 'isActive').and.returnValues(true, false);
    fixture.detectChanges();
    expect(component.dialogPositionLeft).toBe(offsetLeft + offsetWidth + 10);
    expect(component.dialogPositionLeft).toBe(offsetLeft - width);
    expect(spyOnIsXs).toHaveBeenCalledTimes(2);
  });
});
