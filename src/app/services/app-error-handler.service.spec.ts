import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { InitModules } from '../modules/init.module';
import { AppRoutingModule } from '../modules/routing.module';

import { AppErrorHandlerService } from './app-error-handler.service';
import { ErrorsService } from './errors.service';
import { MockErrorsService } from './testing.services.mocks';

describe('AppErrorHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));
  let service: AppErrorHandlerService;
  let router: Router;
  let errorsService: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
        InitModules,
        AppRoutingModule
      ],
      providers: [
        
        AppErrorHandlerService,
        { provide: ErrorsService, useClass: MockErrorsService },
      ],
    });
  });
  
  beforeEach(() => {
    service = TestBed.inject(AppErrorHandlerService);
    errorsService = TestBed.inject(ErrorsService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('should handleError', () => {
    const spyOnErrorService = spyOn(errorsService, 'add').and.callFake(() => {});
    const spyOnRouterNavigate = spyOn(router, 'navigate').and.resolveTo(true);
    const error = new Error('Error test message');
    service.handleError(error);
    expect(spyOnRouterNavigate).toHaveBeenCalledTimes(1);
    expect(spyOnErrorService).toHaveBeenCalledTimes(1);
  });

});
