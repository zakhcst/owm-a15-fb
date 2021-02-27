import { TestBed, waitForAsync } from '@angular/core/testing';
import { StatsService } from './stats.service';
import { MockAngularFireService, MockErrorsService } from './testing.services.mocks';
import { ErrorsService } from './errors.service';
import { SnackbarService } from './snackbar.service';
import { AppModule } from '../app.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AngularFireDatabase } from '@angular/fire/database';
import { Store } from '@ngxs/store';

describe('StatsService', () => {

  let service: StatsService;
  const mockErrorsService = new MockErrorsService();
  const mockAngularFireService = new MockAngularFireService();
  let store: Store;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [AppModule, MatSnackBarModule],
        providers: [SnackbarService, StatsService,
          { provide: ErrorsService, useValue: mockErrorsService },
          { provide: AngularFireDatabase, useValue: mockAngularFireService }
        ],
      });
      service = TestBed.inject(StatsService);
      store = TestBed.inject(Store);
    })
  );

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('it should get data', waitForAsync(() => {
      mockErrorsService.messages = [];
      mockAngularFireService.fbdata = 'test data';
      service.getData().subscribe(
        (response) => {
          expect(mockErrorsService.messages.length).toBe(0);
          expect(response).toBe(mockAngularFireService.fbdata);
        },
        (err) => {
          fail('FAILED TO GET DATA ERROR');
        }
      );
    })
  );
});
