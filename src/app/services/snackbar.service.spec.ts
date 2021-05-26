import { TestBed, tick, fakeAsync, waitForAsync } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { SnackbarService } from './snackbar.service';
import { RequiredModules } from '../modules/required.module';
import { AngularMaterialModule } from '../modules/angular-material/angular-material.module';

import { AppSnackBarInnerComponent } from '../components/app-snack-bar-inner/app-snack-bar-inner.component';
import { ConstantsService } from './constants.service';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { IPopupModel, PopupType } from '../models/snackbar.model';
import { InitModules } from '../modules/init.module';
import { Store } from '@ngxs/store';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('SnackbarService', () => {
  let service: SnackbarService;
  let store: Store;
  let matSnackBar: MatSnackBar;
  const testMessage = { message: `Message: Test`, class: 'popup__info' };
  const calcDelay = () => ConstantsService.snackbarDuration * (testMessage.class === 'popup__error' ? 2 : 1);
  const refStub = of({ dismissedByAction: false }).pipe(delay(calcDelay()));
  const mockRef = (data: IPopupModel): any => {
    return {
      afterDismissed() {
        return refStub;
      },
    };
  };
  const testData:IPopupModel  = {
    message: 'message',
    class: 'class',
    delay: 100,
  }
  

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AppSnackBarInnerComponent],
        imports: [InitModules, RequiredModules, AngularMaterialModule],
        providers: [SnackbarService, Store, MatSnackBar],
      })
        .overrideModule(BrowserDynamicTestingModule, {
          set: {
            entryComponents: [AppSnackBarInnerComponent],
          },
        })
        .compileComponents();
      store = TestBed.inject(Store);
    })
  );

  beforeEach(waitForAsync(() => {
    service = TestBed.inject(SnackbarService);
    matSnackBar = TestBed.inject(MatSnackBar);
  })
  );

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should subscribeToMessages', fakeAsync(() => {
    const spyOnStoreSelect = spyOn(store, 'selectSnapshot').and.returnValue(PopupType.SNACKBAR);
    const spyOnPopupMessage = spyOnProperty(service, 'popupMessage$').and.returnValue(of(testData));
    const spyOnShow = spyOn(service, 'show');
    service.subscribeToMessages();
    expect(spyOnShow).toHaveBeenCalledTimes(1);
  }));

  it('should subscribeToMessages filter non snackbar', fakeAsync(() => {
    const spyOnStoreSelect = spyOn(store, 'selectSnapshot').and.returnValue(PopupType.TOAST);
    const spyOnPopupMessage = spyOnProperty(service, 'popupMessage$').and.returnValue(of(testData));
    const spyOnShow = spyOn(service, 'show');
    service.subscribeToMessages();
    expect(spyOnShow).toHaveBeenCalledTimes(0);
  }));

  it('should manage message queue', fakeAsync(() => {
    const spy = spyOn(service, 'ref').and.callFake(mockRef);

    // Setting 3 elements
    service.show({ ...testMessage, ...{ message: `Message: Test 1` } });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(service.q.length).toBe(1);
    service.show({ ...testMessage, ...{ message: `Message: Test 2` } });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(service.q.length).toBe(2);
    service.show({ ...testMessage, ...{ message: `Message: Test 3` } });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(service.q.length).toBe(3);

    // tail delay
    tick(calcDelay() + 100);
    expect(service.q.length).toBe(2);
    tick(calcDelay() + 100);
    expect(service.q.length).toBe(1);
    tick(calcDelay() + 100);
    expect(service.q.length).toBe(0);
  }));

  it('should ref when no delay', () => {
    delete testData.delay;
    const spyOnShow = spyOn(matSnackBar, 'openFromComponent');
    service.ref(testData);
    expect(spyOnShow).toHaveBeenCalledTimes(1);
  });

  it('should ref when error no delay', () => {
    delete testData.delay;
    testData.class = 'popup__error';
    const spyOnShow = spyOn(matSnackBar, 'openFromComponent');
    service.ref(testData);
    expect(spyOnShow).toHaveBeenCalledTimes(1);
  });

});
