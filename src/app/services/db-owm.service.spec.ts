import { TestBed, waitForAsync } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';
import { DbOwmService } from './db-owm.service';
import { MockAngularFireService } from './testing.services.mocks';
import { AngularFireModule } from '@angular/fire';
import {
  AngularFireDatabaseModule,
  AngularFireDatabase
} from '@angular/fire/database';
import { environment } from 'src/environments/environment';
import { IOwmDataModel } from '../models/owm-data.model';
import { getNewDataObject } from './testing.services.mocks';
import { SharedModule } from '../modules/shared.module';


describe('DbOwmService', () => {
  let service: DbOwmService;
  const testIP = 'ip';
  const testData: IOwmDataModel = getNewDataObject();
  let serviceFB: any;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      imports: [
        RequiredModules,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
        SharedModule
      ],
      providers: [
        DbOwmService,
        { provide: AngularFireDatabase, useClass: MockAngularFireService }
      ]
    });
    service = TestBed.inject(DbOwmService);
    serviceFB = TestBed.inject(AngularFireDatabase);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call setData', waitForAsync(() => {
    service.setData(testIP, testData).then(response => {
      expect(serviceFB.fbdata).toEqual(testData);
      expect(<string>(<any>response)).toBe('Resolved');
    });
  }));

  it('should call getData', waitForAsync(() => {
    service.setData(testIP, testData).then(responseSet => {
      expect(serviceFB.fbdata).toEqual(testData);
      expect(<string>(<any>responseSet)).toBe('Resolved');

      service.getData('cityId').subscribe(responseGet => {
        expect(responseGet).toEqual(testData);
      });
    });
  }));
});