import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { DataCellComponent } from './data-cell.component';
import { getNewDataObject } from '../../services/testing.services.mocks';
import { ConstantsService } from 'src/app/services/constants.service';
import { Subscription } from 'rxjs';

describe('DataCellComponent', () => {
  let component: DataCellComponent;
  let fixture: ComponentFixture<DataCellComponent>;
  const owmData = getNewDataObject();
  const owmDataListByDateKeys = Object.keys(owmData.listByDate).sort((d1, d2) => +d1 - +d2);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppModule ],
      declarations: [ DataCellComponent ],

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataCellComponent);
    component = fixture.componentInstance;
    component.dataDaily = owmData.listByDate[owmDataListByDateKeys[1]];
    component.timeSlot = ConstantsService.timeTemplate[0];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create setWeatherConditionIcon', () => {
    component.conditionStyle = {};
    component.setWeatherConditionIcon();
    expect(component.conditionStyle['background-position']).toBeDefined();
  });

  it('should create setWeatherConditionIcon to return', () => {
    component.conditionStyle = null;
    component.dataDaily = null;
    component.setWeatherConditionIcon();
    expect(component.conditionStyle).toBeNull();
  });

  it('should create setBackground to return', () => {
    component.dataDaily = null;
    component['hostElementRef']['nativeElement']['style']['background-image'] = '';
    component.setBackground(true);
    expect(component['hostElementRef']['nativeElement']['style']['background-image']).toBe('');
  });

  it('should create setBackground showDetailTimeSlotBgPicture', () => {
    component.setBackground(true);
    expect(component['hostElementRef']['nativeElement']['style']['background-image']).toContain('url');
  });

  it('should create setBackground showDetailTimeSlotBgPicture', () => {
    component.setBackground(false);
    expect(component['hostElementRef']['nativeElement']['style']['background-color']).toContain('rgb');
  });

  it('should ngOnInit return', () => {
    const spyOnsetWeatherConditionIcon = spyOn(component, 'setWeatherConditionIcon');
    const spyOnsubscribeShowBackgroundPictire = spyOn(component, 'subscribeShowBackgroundPictire');
    component.dataDaily = null;
    component.ngOnInit();
    expect(spyOnsetWeatherConditionIcon).toHaveBeenCalledTimes(0);
    expect(spyOnsubscribeShowBackgroundPictire).toHaveBeenCalledTimes(0);
  });

  it('should ngOnInit', () => {
    const spyOnsetWeatherConditionIcon = spyOn(component, 'setWeatherConditionIcon');
    const spyOnsubscribeShowBackgroundPictire = spyOn(component, 'subscribeShowBackgroundPictire');
    component.ngOnInit();
    expect(spyOnsetWeatherConditionIcon).toHaveBeenCalledTimes(1);
    expect(spyOnsubscribeShowBackgroundPictire).toHaveBeenCalledTimes(1);
  });

  it('should ngOnDestroy', () => {
    component.subscription = new Subscription();
    const spyOnSubscription = spyOn(component.subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(spyOnSubscription).toHaveBeenCalledTimes(1);
  });

  it('should ngOnDestroy', () => {
    component.subscription = new Subscription();
    const spyOnSubscription = spyOn(component.subscription, 'unsubscribe');
    component.subscription = null;
    component.ngOnDestroy();
    expect(spyOnSubscription).toHaveBeenCalledTimes(0);
  });

});

