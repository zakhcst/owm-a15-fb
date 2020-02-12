import { NgxsModule, Store } from '@ngxs/store';
import {
  AngularFireDatabaseModule,
  AngularFireDatabase
} from '@angular/fire/database';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../environments/environment.prod';

import { TestBed, async } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';

import { HistoryService } from './history.service';
import { AppHistoryState } from '../states/app.state';
import { MockAngularFireService } from './testing.services.mocks';
import {
  HistoryRecordModel,
  AppHistoryPayloadModel
} from '../states/app.models';
import { stat } from 'fs';

describe('HistoryService', () => {

  const testIP = 'ip';
  const testData: HistoryRecordModel = { cityId: 'cityId', time: 0 };
  const appHistoryPayload: AppHistoryPayloadModel = {
    cityId: 'cityId',
    cityName: 'cityName',
    countryISO2: 'countryISO2'
  };
  let service: HistoryService;
  let mockAngularFireService: MockAngularFireService;
  let store: Store;

  beforeEach(async(() => {
    mockAngularFireService = new MockAngularFireService();

    TestBed.configureTestingModule({
      imports: [
        RequiredModules,
        NgxsModule.forRoot([AppHistoryState], {
          developmentMode: !environment.production
        }),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule
      ],
      providers: [
        HistoryService,
        { provide: AngularFireDatabase, useValue: mockAngularFireService },
        Store
      ]
    });
    service = TestBed.get(HistoryService);
    store = TestBed.get(Store);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call AngularFireDatabase set', async(() => {
    const serviceFB = TestBed.get(AngularFireDatabase);
    service.setDataToFB(testIP, testData).then(response => {
      expect(<string>(<any>response)).toBe('Resolved');
      expect(serviceFB.fbdata).toEqual(testData.cityId);
    });
  }));

  it('should dispatch history log', () => {
    const spyDispatch = spyOn(store, 'dispatch');
    service.add(appHistoryPayload);
    expect(spyDispatch).toHaveBeenCalledTimes(1);
  });
});
