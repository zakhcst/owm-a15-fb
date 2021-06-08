import { TestBed, waitForAsync } from '@angular/core/testing';
import { InitModules } from '../modules/init.module';
import { RequiredModules } from '../modules/required.module';
import { AngularFireDatabase } from '@angular/fire/database';
import { Store } from '@ngxs/store';

import { ErrorsService } from './errors.service';
import { MockAngularFireService } from './testing.services.mocks';
import { ErrorRecordModel, AppErrorModel } from '../states/app.models';

describe('ErrorsService', () => {

  const testIP = 'ip';
  const testData: ErrorRecordModel = { logMessage: 'Log Message', time: 0 };
  const appErrorPayload: AppErrorModel = {
    userMessage: 'userMessage',
    logMessage: 'logMessage'
  };
  let mockAngularFireService: MockAngularFireService;
  let service: ErrorsService;

  beforeEach(waitForAsync(() => {
    mockAngularFireService = new MockAngularFireService();

    TestBed.configureTestingModule({
      imports: [InitModules, RequiredModules],
      providers: [
        ErrorsService,
        { provide: AngularFireDatabase, useValue: mockAngularFireService },
        Store
      ]
    });
    service = TestBed.inject(ErrorsService);
    TestBed.inject(AngularFireDatabase);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getData', waitForAsync(() => {
    mockAngularFireService.fbdata = 'test data';
    const spyOnmockAngularFireService = spyOn(mockAngularFireService.ref, 'valueChanges').and.callThrough();
    service.getData().subscribe((responseData) => {
      expect(spyOnmockAngularFireService).toHaveBeenCalledTimes(1);
      expect(responseData).toBe(mockAngularFireService.fbdata);
    });
  }));


  it('should setDataToFB', waitForAsync(() => {
    const serviceFB = TestBed.inject(AngularFireDatabase);
    const afsObject = spyOn(serviceFB, 'object').and.callThrough();

    service.setDataToFB(testIP, testData).then(response => {
      expect(<string>(<any>response)).toBe('Resolved');
    });

    expect(afsObject).toHaveBeenCalledTimes(1);
  }));

  it('should dispatch error', () => {
    const store = TestBed.inject(Store);
    const spyDispatch = spyOn(store, 'dispatch');
    const spySetDataToFb = spyOn(service, 'setDataToFB');
    service.add(appErrorPayload);
    expect(spyDispatch).toHaveBeenCalledTimes(2);
    expect(spySetDataToFb).toHaveBeenCalledTimes(1);
  });
});
