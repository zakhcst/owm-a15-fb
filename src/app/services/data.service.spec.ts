import { TestBed, async } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';
import { DataService } from './data.service';
import { MockAngularFireService } from './testing.services.mocks';
import { AngularFireModule } from '@angular/fire';
import {
  AngularFireDatabaseModule,
  AngularFireDatabase
} from '@angular/fire/database';
import { environment } from 'src/environments/environment';
import { IOwmDataModel } from '../models/owm-data.model';
import { getNewDataObject } from './testing.services.mocks';


describe('DataService', () => {
  let service: DataService;
  const testIP = 'ip';
  const testData: IOwmDataModel = getNewDataObject();
  let serviceFB: any;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        RequiredModules,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule
      ],
      providers: [
        DataService,
        { provide: AngularFireDatabase, useClass: MockAngularFireService }
      ]
    });
    service = TestBed.get(DataService);
    serviceFB = TestBed.get(AngularFireDatabase);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call setData', async(() => {
    service.setData(testIP, testData).then(response => {
      expect(serviceFB.fbdata).toEqual(testData);
      expect(<string>(<any>response)).toBe('Resolved');
    });
  }));

  it('should call getData', async(() => {
    service.setData(testIP, testData).then(responseSet => {
      expect(serviceFB.fbdata).toEqual(testData);
      expect(<string>(<any>responseSet)).toBe('Resolved');

      service.getData('cityId').subscribe(responseGet => {
        expect(responseGet).toEqual(testData);
      });
    });
  }));
});
