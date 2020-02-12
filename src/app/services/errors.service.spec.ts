import { TestBed, async } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';

import { NgxsModule, Store } from '@ngxs/store';
import {
  AngularFireDatabaseModule,
  AngularFireDatabase
} from '@angular/fire/database';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../environments/environment.prod';


import { ErrorsService } from './errors.service';
import { AppErrorsState } from '../states/app.state';
import { MockAngularFireService } from './testing.services.mocks';
import { ErrorRecordModel, AppErrorPayloadModel } from '../states/app.models';

describe('ErrorsService', () => {

  const testIP = 'ip';
  const testData: ErrorRecordModel = { logMessage: 'Log Message', time: 0 };
  const appErrorPayload: AppErrorPayloadModel = {
    userMessage: 'userMessage',
    logMessage: 'logMessage'
  };
  let mockAngularFireService: MockAngularFireService;
  let service: ErrorsService;

  beforeEach(async(() => {
    mockAngularFireService = new MockAngularFireService();

    TestBed.configureTestingModule({
      imports: [
        RequiredModules,
        NgxsModule.forRoot([AppErrorsState], {
          developmentMode: !environment.production
        }),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule
      ],
      providers: [
        ErrorsService,
        { provide: AngularFireDatabase, useValue: mockAngularFireService },
        Store,
      ]
    });
    service = TestBed.get(ErrorsService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call AngularFireDatabase set', async(() => {
    const serviceFB = TestBed.get(AngularFireDatabase);
    const afsObject = spyOn(serviceFB, 'object').and.callThrough();

    service.setDataToFB(testIP, testData).then(response => {
      expect(<string>(<any>response)).toBe('Resolved');
    });

    expect(afsObject).toHaveBeenCalledTimes(1);
  }));

  it('should dispatch error', () => {
    const store = TestBed.get(Store);
    const spyDispatch = spyOn(store, 'dispatch');
    service.add(appErrorPayload);
    expect(spyDispatch).toHaveBeenCalledTimes(1);
  });
});
