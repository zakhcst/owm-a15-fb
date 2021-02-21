import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RequiredModules } from 'src/app/modules/required.module';
import { SharedModule } from 'src/app/modules/shared.module';
import { SnackbarService } from 'src/app/services/snackbar.service';

import { StatsComponent } from './stats.component';

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RequiredModules, SharedModule],
      declarations: [ StatsComponent ],
      providers: [SnackbarService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
