import { OverlayContainer } from '@angular/cdk/overlay';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, timer } from 'rxjs';
import { PopupType } from '../../models/snackbar.model';
import { InitModules } from '../../modules/init.module';
import { RequiredModules } from '../../modules/required.module';
import { SharedModule } from '../../modules/shared.module';
import { ConstantsService } from '../../services/constants.service';

import { ToastOverlayComponent } from './toast-overlay.component';

const mockMessage = {
  message: `Selected: cityName, countryISO2`,
  class: 'popup__info',
  delay: 500
};

describe('ToastOverlayComponent', () => {
  let component: ToastOverlayComponent;
  let store: Store;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitModules, RequiredModules, SharedModule],
      declarations: [ToastOverlayComponent],
      providers:[
        OverlayContainer,
        Store
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(Store);
    component = new ToastOverlayComponent(store);
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should subscribeToMessages TOAST', () => {
    const spyOnSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValue(PopupType.TOAST);
    const spyOnSelectPopupMessages = spyOn(store, 'select').and.returnValue(of(mockMessage));
    const spyOnTriggerShift = spyOn(component, 'triggerShift').and.callFake(() => {});
    expect(component.items.length).toBe(0);
    component.subscribeToMessages();
    expect(component.items.length).toBe(1);
    expect(spyOnTriggerShift).toHaveBeenCalledTimes(1);
  });
  
  it('should subscribeToMessages reject SNACKBAR', () => {
    const spyOnSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValue(PopupType.SNACKBAR);
    const spyOnSelectPopupMessages = spyOn(store, 'select').and.returnValue(of(mockMessage));
    const spyOnTriggerShift = spyOn(component, 'triggerShift').and.callFake(() => {});
    expect(component.items.length).toBe(0);
    component.subscribeToMessages();
    expect(component.items.length).toBe(0);
    expect(spyOnTriggerShift).toHaveBeenCalledTimes(0);
  });

  it('should triggerShift', fakeAsync(() => {

    component.isOpen = true;
    component.items.push(mockMessage);
    component.items.push(mockMessage);
    expect(component.items.length).toBe(2);
    component.triggerShift(mockMessage);
    tick(mockMessage.delay + ConstantsService.popupDelay_ms);
    expect(component.items.length).toBe(1);
    expect(component.isOpen).toBe(true);
    
    component.triggerShift(mockMessage);
    tick(mockMessage.delay + ConstantsService.popupDelay_ms);
    expect(component.items.length).toBe(0);
    expect(component.isOpen).toBe(false);

  }));

  it('should ngOnInit', () => {
    const spyOnSubscribeToMessages = spyOn(component, 'subscribeToMessages').and.callFake(() => {});
    component.ngOnInit();
    expect(spyOnSubscribeToMessages).toHaveBeenCalledTimes(1);
  });

  it('should ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(component.subscriptions).toBeUndefined();
    
    component.subscriptions = timer(1).subscribe();
    const spyOnUnsubscribe = spyOn(component.subscriptions, 'unsubscribe').and.callFake(() => {});
    component.ngOnDestroy();
    expect(component.subscriptions).toBeDefined();
    expect(spyOnUnsubscribe).toHaveBeenCalledTimes(1);
  });


});
