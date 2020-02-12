import { TestBed, tick, fakeAsync, async } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { SnackbarService } from './snackbar.service';
import { RequiredModules } from '../modules/required.module';
import { AngularMaterialModule } from '../modules/angular-material/angular-material.module';

import { AppSnackBarInnerComponent } from '../components/app-snack-bar-inner/app-snack-bar-inner.component';
import { ConstantsService } from './constants.service';
import { delay } from 'rxjs/operators';
import { of, asyncScheduler } from 'rxjs';

describe('SnackbarService', () => {
  let service: SnackbarService;
  const testMessage = { message: `Message: Test`, class: 'snackbar__info' };
  const calcDelay = () =>
    ConstantsService.snackbarDuration *
    (testMessage.class === 'snackbar__error' ? 2 : 1);
  const refStub = of('Streamed on afterDismissed()', asyncScheduler).pipe(
    delay(calcDelay())
  );
  const mockRef = () => {
    return {
      afterDismissed() {
        return refStub;
      }
    };
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppSnackBarInnerComponent],
      imports: [RequiredModules, AngularMaterialModule],
      providers: [SnackbarService]
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [AppSnackBarInnerComponent]
        }
      })
      .compileComponents();
  }));

  beforeEach(async(() => {
    service = TestBed.get(SnackbarService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should manage message queue', fakeAsync(() => {
    const spy = spyOn(service, 'ref').and.callFake(mockRef);

    // Setting 3 elements
    service.show({ ...testMessage });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(service.q.length).toBe(1);
    service.show({ ...testMessage });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(service.q.length).toBe(2);
    service.show({ ...testMessage });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(service.q.length).toBe(3);

    // tail delay
    tick(calcDelay() + 10);
    expect(service.q.length).toBe(2);
    tick(calcDelay() + 10);
    expect(service.q.length).toBe(1);
    tick(calcDelay() + 10);
    expect(service.q.length).toBe(0);
  }));
});
