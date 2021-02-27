import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AppRoutingModule } from '../../modules/routing.module';
import { ConstantsService } from '../../services/constants.service';
import { ErrorPageComponent } from './error-page.component';

describe('ErrorPageComponent', () => {
  let component: ErrorPageComponent;
  let fixture: ComponentFixture<ErrorPageComponent>;
  let router: Router;
  const params = {
    errorMessage: 'Test Error Message',
    redirectPage: 'Test Redirect Page',
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ ErrorPageComponent ],
        imports: [ AppRoutingModule ],
        providers: [ { provide: ActivatedRoute, useValue: { params : of(params) } } ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate from the page', fakeAsync(() => {
    expect(component).toBeTruthy();
    const spyNavigate = spyOn(router, 'navigate').and.callThrough();
    fixture.detectChanges();

    tick(ConstantsService.redirectDelay * 1000);
    expect(spyNavigate).toHaveBeenCalledTimes(1);
    expect(spyNavigate).toHaveBeenCalledWith([params.redirectPage]);
  }));
});
