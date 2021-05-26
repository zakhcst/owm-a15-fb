import { TestBed, waitForAsync } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { InitModules } from '../modules/init.module';
import { RequiredModules } from '../modules/required.module';
import { AngularFireDatabase } from '@angular/fire/database';
import { cold } from 'jasmine-marbles';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { ICity } from '../models/cities.model';
import { CitiesService } from './cities.service';
import { MockAngularFireService } from './testing.services.mocks';

describe('CitiesService', () => {
  let service: CitiesService;
  let store: Store;
  let mockAngularFireService: MockAngularFireService;
  let angularFireDatabase: any;

  const testData: ICity = {
    name: 'testData: ICity: nameString',
    country: 'testData: ICity: countryString',
    iso2: 'testData: ICity: iso2String',
  };

  beforeEach(() => {
    mockAngularFireService = new MockAngularFireService();
    TestBed.configureTestingModule({
      imports: [InitModules, RequiredModules],
      providers: [CitiesService,
        { provide: AngularFireDatabase, useValue: mockAngularFireService }
      ],
    });
    service = TestBed.inject(CitiesService);
    store = TestBed.inject(Store);
    angularFireDatabase = TestBed.inject(AngularFireDatabase);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should dispatch', () => {
    // const testData = { 'cityId': 'ICity' }; 
    const spyDispatch = spyOn(store, 'dispatch');
    service.dispatch(testData);
    expect(spyDispatch).toHaveBeenCalled();
  });

  it('should getData', waitForAsync(() => {
    mockAngularFireService.fbdata = 'test data';
    const spyOnmockAngularFireService = spyOn(mockAngularFireService.ref, 'valueChanges').and.callThrough();
    service.getData().subscribe((responseData) => {
      expect(spyOnmockAngularFireService).toHaveBeenCalledTimes(1);
      expect(responseData).toBe(mockAngularFireService.fbdata);
    });
  }));

  it('should activateLiveDataUpdatesCities subscribeToGetData when liveDataUpdate$ is true', waitForAsync(() => {
    const q$ = cold('-t|', { t: true, f: false });
    service.getDataSubscription.unsubscribe();
    service.liveDataUpdateSubscription.unsubscribe();
    const spyOnSubscribeToGetData = spyOn(service, 'subscribeToGetData');
    const spyOnGetDataOnce = spyOn(service, 'getDataOnce');
    const spyOnLiveDataUpdate$ = spyOnProperty(service, 'liveDataUpdate$').and.returnValue(q$);

    q$.pipe(delay(10)).subscribe(() => {
      expect(spyOnGetDataOnce).toHaveBeenCalledTimes(0);
      expect(spyOnSubscribeToGetData).toHaveBeenCalledTimes(1);
    });
    service.activateLiveDataUpdatesCities();
    expect(spyOnLiveDataUpdate$).toHaveBeenCalledTimes(1);
  }));

  it('should activateLiveDataUpdatesCities getDataOnce when liveDataUpdate$ is false', waitForAsync(() => {
    const q$ = cold('-f|', { t: true, f: false });
    service.getDataSubscription.unsubscribe();
    service.liveDataUpdateSubscription.unsubscribe();
    const spyOnSubscribeToGetData = spyOn(service, 'subscribeToGetData');
    const spyOnGetDataOnce = spyOn(service, 'getDataOnce');
    const spyOnLiveDataUpdate$ = spyOnProperty(service, 'liveDataUpdate$').and.returnValue(q$);

    q$.pipe(delay(10)).subscribe(() => {
      expect(spyOnGetDataOnce).toHaveBeenCalledTimes(1);
      expect(spyOnSubscribeToGetData).toHaveBeenCalledTimes(0);
    });
    service.activateLiveDataUpdatesCities();
    expect(spyOnLiveDataUpdate$).toHaveBeenCalledTimes(1);
  }));

  it('should getDataOnce when AppCitiesState.selectCities is null', waitForAsync(() => {
    const spyOnStoreSelect = spyOn(store, 'selectSnapshot').and.returnValue(null);
    const spyOnGetData = spyOn(service, 'getData').and.returnValue(of({'cityId1': testData}));
    const spyDispatch = spyOn(store, 'dispatch');
    service.getDataOnce();
    expect(spyOnStoreSelect).toHaveBeenCalledTimes(1);
    expect(spyOnGetData).toHaveBeenCalledTimes(1);
    expect(spyDispatch).toHaveBeenCalledTimes(1);
  }));
  
  it('should not getDataOnce when AppCitiesState.selectCities is not null', waitForAsync(() => {
    const spyOnStoreSelect = spyOn(store, 'selectSnapshot').and.returnValue(true);
    const spyOnGetData = spyOn(service, 'getData');
    service.getDataOnce();
    expect(spyOnStoreSelect).toHaveBeenCalledTimes(1);
    expect(spyOnGetData).toHaveBeenCalledTimes(0);
  }));

});
