import { TestBed } from '@angular/core/testing';
import { PreloadAllModules, RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgxsModule } from '@ngxs/store';
import { environment } from 'src/environments/environment';
import { appRoutes, AppRoutingModule } from '../modules/routing.module';

import { AppInitService } from './app-init.service';

describe('AppInitService', () => {
  let service: AppInitService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ AppRoutingModule,
        RouterModule.forRoot(appRoutes, {
          preloadingStrategy: PreloadAllModules,
          relativeLinkResolution: 'legacy',
        }),
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        NgxsModule.forRoot([]) ],
    });
    service = TestBed.inject(AppInitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
