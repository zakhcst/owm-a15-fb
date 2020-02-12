import { TestBed, async } from '@angular/core/testing';
import { OwmStatsService } from './owm-stats.service';
import { RequiredModules } from '../modules/required.module';
import {
  AngularFireDatabase,
  AngularFireDatabaseModule
} from '@angular/fire/database';
import {
  MockAngularFireService,
  MockErrorsService
} from './testing.services.mocks';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment.prod';
import { ErrorsService } from './errors.service';

describe('OwmStatsService', () => {
  let service: OwmStatsService;
  const mockErrorsService = new MockErrorsService();
  const mockAngularFireService = new MockAngularFireService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RequiredModules,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule
      ],
      providers: [
        OwmStatsService,
        { provide: AngularFireDatabase, useValue: mockAngularFireService },
        { provide: ErrorsService, useValue: mockErrorsService }
      ]
    });
    service = TestBed.get(OwmStatsService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('should fail when no data is received', (done: DoneFn) => {
  it('should fail when no data is received', async(() => {
    mockErrorsService.messages = [];
    service.getData().subscribe(
      () => {
        fail();
        // done();
      },
      error => {
        expect(mockErrorsService.messages.length).toBeTruthy(1);
        // done();
      }
    );
  }));

  // it('it should get data', (done: DoneFn) => {
  it('it should get data', async(() => {
    mockErrorsService.messages = [];
    mockAngularFireService.fbdata = 'test data';
    service.getData().subscribe(
      response => {
        expect(mockErrorsService.messages.length).toBe(0);
        expect(response).toBe(mockAngularFireService.fbdata);
        // done();
      },
      // (err) => {
      //   fail();
      //   // done();
      // }
      error => fail(error)
    );
  }));
});
