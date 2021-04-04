import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsModule, Store } from '@ngxs/store';
import { of } from 'rxjs';
import { SharedModule } from 'src/app/modules/shared.module';
import { ErrorsService } from 'src/app/services/errors.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MockErrorsService } from 'src/app/services/testing.services.mocks';
import { AppCitiesState, AppHistoryLogState, AppStatsState, AppStatusState } from 'src/app/states/app.state';

import { StatsComponent } from './stats.component';

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;
  let store: Store;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          BrowserModule,
          BrowserAnimationsModule,
          SharedModule,
          NgxsModule.forRoot([AppStatusState, AppCitiesState, AppHistoryLogState, AppStatsState]),
        ],
        declarations: [StatsComponent],
        providers: [SnackbarService, Store, 
          {provide: ErrorsService, useClass: MockErrorsService}],
      }).compileComponents();
      store = TestBed.inject(Store);
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    spyOn(store, 'select').and.callFake((selector) => of({}));
    fixture.detectChanges();
    expect(component).toBeDefined();
  });
});
