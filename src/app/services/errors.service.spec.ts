import { TestBed, waitForAsync } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';

import { NgxsModule, Store } from '@ngxs/store';
import {
  AngularFireDatabaseModule,
  AngularFireDatabase
} from '@angular/fire/database';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../environments/environment.prod';


import { ErrorsService } from './errors.service';
import { MockAngularFireService } from './testing.services.mocks';
import { ErrorRecordModel, AppErrorPayloadModel } from '../states/app.models';
import { AppModule } from '../app.module';

describe('ErrorsService', () => {

  const testIP = 'ip';
  const testData: ErrorRecordModel = { logMessage: 'Log Message', time: 0 };
  const appErrorPayload: AppErrorPayloadModel = {
    userMessage: 'userMessage',
    logMessage: 'logMessage'
  };
  let mockAngularFireService: MockAngularFireService;
  let service: ErrorsService;

  beforeEach(waitForAsync(() => {
    mockAngularFireService = new MockAngularFireService();

    TestBed.configureTestingModule({
      imports: [
        AppModule,
      ],
      providers: [
        ErrorsService,
        { provide: AngularFireDatabase, useValue: mockAngularFireService },
        Store
      ]
    });
    service = TestBed.inject(ErrorsService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call AngularFireDatabase set', waitForAsync(() => {
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
    service.add(appErrorPayload);
    expect(spyDispatch).toHaveBeenCalledTimes(1);
  });
});
