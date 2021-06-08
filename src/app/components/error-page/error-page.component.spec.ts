import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { activatedRouteMock, activatedRouteParamsSubject } from 'src/app/services/testing.services.mocks';
import { AppRoutingModule } from '../../modules/routing.module';
import { ConstantsService } from '../../services/constants.service';
import { ErrorPageComponent } from './error-page.component';

describe('ErrorPageComponent', () => {
  let component: ErrorPageComponent;
  let fixture: ComponentFixture<ErrorPageComponent>;
  let router: Router;


  const paramsDefined = {
    errorMessage: 'Test Error Message',
    redirectPage: 'Test Redirect Page',
  };
  const paramsUndefined = {
    errorMessage: undefined,
    redirectPage: undefined,
  };


  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ErrorPageComponent],
        imports: [AppRoutingModule],
        // providers: [ { provide: ActivatedRoute, useValue: { get params() : of(routeParams) } } ]
        providers: [{ provide: ActivatedRoute, useValue: activatedRouteMock }]
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
    const spyNavigate = spyOn(router, 'navigate').and.callThrough();
    fixture.detectChanges();
    activatedRouteParamsSubject.next(paramsDefined);

    tick(ConstantsService.redirectDelay * 1000);
    expect(spyNavigate).toHaveBeenCalledTimes(1);
    expect(spyNavigate).toHaveBeenCalledWith([paramsDefined.redirectPage]);
  }));

  it('should navigate from the page without params', fakeAsync(() => {
    const spyNavigate = spyOn(router, 'navigate');

    fixture.detectChanges();
    activatedRouteParamsSubject.next(paramsUndefined);
    tick(ConstantsService.redirectDelay * 1000);
    expect(spyNavigate).toHaveBeenCalledTimes(1);
    expect(spyNavigate).toHaveBeenCalledWith(['']);
  }));
});
