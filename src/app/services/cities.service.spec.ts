import { TestBed, async } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';
import { MockAngularFireService } from './testing.services.mocks';
import { CitiesService } from './cities.service';
import {
  AngularFireDatabase,
  AngularFireDatabaseModule
} from '@angular/fire/database';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment.prod';
import { ICity } from '../models/cities.model';

describe('CitiesService', () => {
  let service: CitiesService;
  let angularFireService: MockAngularFireService;
  const testData: ICity = {
    name: 'testData: ICity: nameString',
    country: 'testData: ICity: countryString',
    iso2: 'testData: ICity: iso2String'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RequiredModules,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule
      ],
      providers: [
        CitiesService,
        { provide: AngularFireDatabase, useClass: MockAngularFireService }
      ]
    });
    service = TestBed.get(CitiesService);
    angularFireService = TestBed.get(AngularFireDatabase);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update reads', async(() => {
    angularFireService.fbdata = testData;
    service.updateReads('cityId').subscribe(response1 => {
      expect(<string>(<any>response1)).toBe('Resolved');
      expect(angularFireService.fbdata.r).toBe(1);
      service.updateReads('cityId').subscribe(response2 => {
        expect(<string>(<any>response2)).toBe('Resolved');
        expect(angularFireService.fbdata.r).toBe(2);
      });
    });
  }));

  it('should get reads', async(() => {
    angularFireService.fbdata = testData;
    service.updateReads('cityId').subscribe(response1 => {
      expect(<string>(<any>response1)).toBe('Resolved');
      expect(angularFireService.fbdata.r).toBe(1);

      service.getData().subscribe(response2 => {
        expect(<number>(<any>response2.r)).toBe(1);
      });
    });
  }));
});
