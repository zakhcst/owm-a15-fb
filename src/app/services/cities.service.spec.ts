import { TestBed } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';
import { MockAngularFireService } from './testing.services.mocks';
import { CitiesService } from './cities.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { ICity } from '../models/cities.model';
import { Store } from '@ngxs/store';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('CitiesService', () => {
  let service: CitiesService;
  let store: Store;

  const testData: ICity = {
    name: 'testData: ICity: nameString',
    country: 'testData: ICity: countryString',
    iso2: 'testData: ICity: iso2String',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RequiredModules, MatSnackBarModule],
      providers: [CitiesService,
        { provide: AngularFireDatabase, useClass: MockAngularFireService }
      ],
    });
    service = TestBed.inject(CitiesService);
    store = TestBed.inject(Store);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
