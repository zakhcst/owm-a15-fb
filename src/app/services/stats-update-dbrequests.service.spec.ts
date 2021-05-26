import { AngularFireDatabase } from '@angular/fire/database';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MockAngularFireService, MockErrorsService } from './testing.services.mocks';
import { StatsUpdateService } from './stats-update-dbrequests.service';
import { ErrorsService } from './errors.service';

describe('StatsUpdateService', () => {
  let service: StatsUpdateService;
  let mockAngularFireService: MockAngularFireService;
  let angularFireDatabase: any;
  let mockErrorsService: MockErrorsService;
  let errorsService: any;

  beforeEach(
    waitForAsync(() => {
      mockAngularFireService = new MockAngularFireService();
      mockErrorsService = new MockErrorsService();
      TestBed.configureTestingModule({
        providers: [
          StatsUpdateService,
          { provide: AngularFireDatabase, useValue: mockAngularFireService },
          { provide: ErrorsService, useValue: mockErrorsService },
        ],
      });
      service = TestBed.inject(StatsUpdateService);
      angularFireDatabase = TestBed.inject(AngularFireDatabase);
      errorsService = TestBed.inject(ErrorsService);
    })
  );

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add error if no city id', () => {
    const spyOnAddError = spyOn(service, 'addError');
    service.updateStatsDBRequests(null);
    expect(spyOnAddError).toHaveBeenCalledWith('CityId not provided');
  });

  it('should updateStatsDBRequests undefined', fakeAsync(() => {
      const cityId = 'test';
      mockAngularFireService.fbdata = undefined;
      mockAngularFireService.error = false;
      service.updateStatsDBRequests(cityId);
      tick();
      expect(mockAngularFireService.fbdata.r).toBe(1);
  }));

  it('should updateStatsDBRequests increment', fakeAsync(() => {
      const cityId = 'testCityId';
      const existingValue = 10;
      mockAngularFireService.fbdata = { r: existingValue };
      mockAngularFireService.error = false;
      service.updateStatsDBRequests(cityId);
      tick();
      expect(mockAngularFireService.fbdata.r).toBe(existingValue + 1);
  }));

  it('should updateStatsDBRequests catch error on read', fakeAsync(() => {
      const spyOnAddError = spyOn(service, 'addError').and.callThrough();
      const spyOnErrorsService = spyOn(errorsService, 'add').and.returnValue(undefined);
      const cityId = 'testCityId';
      const existingValue = 10;
      mockAngularFireService.fbdata = { r: existingValue };
      mockAngularFireService.error = 'TEST updateStatsDBRequests: VALUE CHANGE ERROR MESSAGE';
      service.updateStatsDBRequests(cityId);
      tick();
      expect(mockAngularFireService.fbdata.r).toBe(existingValue);
      expect(spyOnAddError).toHaveBeenCalledTimes(1);
      expect(spyOnErrorsService).toHaveBeenCalledTimes(1);
  }));

  it('should updateStatsDBRequests catch errors on update', fakeAsync(() => {
      const spyOnAddError = spyOn(service, 'addError');
      const spyOnAngularFireDatabaseUpdate = spyOn(mockAngularFireService.ref, 'update').and.callFake(() => Promise.reject('TEST updateStatsDBRequests: UPDATE ERROR MESSAGE'));
      const cityId = 'testCityId';
      const existingValue = 10;
      mockAngularFireService.fbdata = { r: existingValue };
      mockAngularFireService.error = false;
      service.updateStatsDBRequests(cityId);
      tick();
      expect(mockAngularFireService.fbdata.r).toBe(existingValue);
      expect(spyOnAngularFireDatabaseUpdate).toHaveBeenCalledTimes(1);
      expect(spyOnAddError).toHaveBeenCalledTimes(1);
  }));

  it('should addErrors', fakeAsync(() => {
      const spyOnErrorsAdd = spyOn(errorsService, 'add');
      const errorMessage = 'TEST UPDATE ADD ERROR MESSAGE';
      service.addError(errorMessage);
      
      expect(spyOnErrorsAdd).toHaveBeenCalledTimes(1);
  }));

});
