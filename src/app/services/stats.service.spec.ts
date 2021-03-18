import { TestBed, waitForAsync } from '@angular/core/testing';
import { StatsService } from './stats.service';
import { MockAngularFireService, MockErrorsService } from './testing.services.mocks';
import { ErrorsService } from './errors.service';
import { SnackbarService } from './snackbar.service';
import { AppModule } from '../app.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AngularFireDatabase } from '@angular/fire/database';
import { NgxsModule, Store } from '@ngxs/store';

describe('StatsService', () => {
  let service: StatsService;
  let store: Store;
  let mockErrorsService: MockErrorsService;
  let mockAngularFireService: MockAngularFireService;
  let angularFireDatabase: AngularFireDatabase;
  
  beforeEach(
    waitForAsync(() => {
      mockErrorsService = new MockErrorsService();
      mockAngularFireService = new MockAngularFireService();
      TestBed.configureTestingModule({
        // imports: [AppModule],
        imports: [NgxsModule.forRoot([])],
        providers: [
          SnackbarService,
          StatsService,
          { provide: ErrorsService, useValue: mockErrorsService },
          { provide: AngularFireDatabase, useValue: mockAngularFireService },
        ],
      });
      service = TestBed.inject(StatsService);
      store = TestBed.inject(Store);
      angularFireDatabase = TestBed.inject(AngularFireDatabase);
    })
  );

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it(
    'it should get data',
    waitForAsync(() => {
      mockAngularFireService.fbdata = 'test data';
      mockAngularFireService.error = false;
      service.getData().subscribe(
        (response) => {
          expect(response).toBe(mockAngularFireService.fbdata);
        },
        (err) => {
          fail('FAILED TO GET DATA ERROR' + err);
        }
      );
    })
  );
});
