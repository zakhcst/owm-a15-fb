import { Store } from '@ngxs/store';
import { AngularFireDatabase } from '@angular/fire/database';

import { TestBed, waitForAsync } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';

import { HistoryLogService } from './history-log.service';
import { MockAngularFireService } from './testing.services.mocks';
import { HistoryLogModel } from '../states/app.models';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('HistoryLogService', () => {
  const testIP = 'ip';
  const testData: HistoryLogModel = { cityId: 'cityId', time: 0 };
  let service: HistoryLogService;
  let mockAngularFireService: MockAngularFireService;
  let store: Store;

  beforeEach(() => {
    mockAngularFireService = new MockAngularFireService();

    TestBed.configureTestingModule({
      imports: [RequiredModules, MatSnackBarModule],
      providers: [HistoryLogService, { provide: AngularFireDatabase, useValue: mockAngularFireService }, Store],
    });
    service = TestBed.inject(HistoryLogService);
    store = TestBed.inject(Store);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should dispatch history log', () => {
    const spyDispatch = spyOn(store, 'dispatch');
    service.dispatch(testData);
    expect(spyDispatch).toHaveBeenCalledTimes(1);
  });
});
