import { AngularFireDatabase } from '@angular/fire/database';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';
import { historyLogMockModelData, MockAngularFireService } from './testing.services.mocks';
import { HistoryLogModel } from '../states/app.models';
import { InitModules } from '../modules/init.module';
import { HistoryLogUpdateService } from './history-log-update.service';

describe('HistoryLogUpdateService', () => {
  let service: HistoryLogUpdateService;
  let mockAngularFireService: MockAngularFireService;
  let angularFireDatabase: any;

  beforeEach(() => {
    mockAngularFireService = new MockAngularFireService();

    TestBed.configureTestingModule({
      imports: [InitModules, RequiredModules],
      providers: [
        HistoryLogUpdateService,
        { provide: AngularFireDatabase, useValue: mockAngularFireService },
      ],
    });
    service = TestBed.inject(HistoryLogUpdateService);
    angularFireDatabase = TestBed.inject(AngularFireDatabase);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should setDataToFB', waitForAsync(() => {
    const historyLogMock: HistoryLogModel = historyLogMockModelData;
    const normIp = '1-1-1-1';
    const spyOnSetData = spyOn(mockAngularFireService.ref, 'set');
    
    Promise.resolve(service.setDataToFB(normIp, historyLogMock)).then(() => {
        expect(spyOnSetData).toHaveBeenCalledTimes(1);
        expect(spyOnSetData).toHaveBeenCalledWith(historyLogMock.cityId);
    });
  }));

});
