import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';

import { OwmDataUtilsService } from './owm-data-utils.service';
import { getNewDataObject } from './testing.services.mocks';

describe('OwmDataUtilsService', () => {
  let service: OwmDataUtilsService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ NgxsModule.forRoot([]) ],
      providers: [ Store ]
    });
    service = TestBed.inject(OwmDataUtilsService);
    store = TestBed.inject(Store);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('setListByDate: should set listByDate', () => {
    expect(service.setListByDate(getNewDataObject('owm')).listByDate).toBeTruthy();
  });

  it('isNotExpired: fallback/sample data should be expired', () => {
    const expiredData = getNewDataObject('owm');
    const isNotExpired = service.isNotExpired(expiredData);
    expect(isNotExpired).toBe(false);
  });

  it('isNotExpired: property updated set to Now() should be not expired', () => {
    const notExpiredDataWithUpdatedSet = getNewDataObject('owm');
    notExpiredDataWithUpdatedSet.updated = new Date().valueOf();
    const isNotExpired = service.isNotExpired(notExpiredDataWithUpdatedSet);
    expect(isNotExpired).toBe(true);
  });

  it('isNotExpired: list 0 element date/time set to now() in fallback should be not expired', () => {
    const notExpiredData = getNewDataObject('owm');
    notExpiredData.list[0].dt = new Date().valueOf() / 1000;
    const isNotExpired = service.isNotExpired(notExpiredData);
    expect(isNotExpired).toBe(true);
  });
});
