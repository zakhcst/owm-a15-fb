import { TestBed, waitForAsync } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { OwmFallbackDataService } from 'src/app/services/owm-fallback-data.service';

import { ResolverFallbackService } from './resolver-fallback.service';
import { getNewDataObject } from '../../services/testing.services.mocks';
import { of } from 'rxjs';
import { AppFallbackDataState } from 'src/app/states/app.state';

describe('ResolverFallbackService', () => {
  let resolverFallbackService: ResolverFallbackService;
  let owmFallbackDataService: OwmFallbackDataService;
  let store: Store;
  let fallbackData: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([AppFallbackDataState])],

      providers: [
        Store,
        {
          provide: OwmFallbackDataService,
          useValue: { getData: () => of(null) },
        },
      ],
    });
    resolverFallbackService = TestBed.inject(ResolverFallbackService);
    owmFallbackDataService = TestBed.inject(OwmFallbackDataService);
    store = TestBed.inject(Store);
    fallbackData = getNewDataObject();
  });

  it('should be created', () => {
    expect(resolverFallbackService).toBeDefined();
  });

  it('should resolve data when data is not in Store and dispatch it', waitForAsync(() => {
      spyOn(store, 'selectSnapshot').and.returnValue(null);
      spyOn(owmFallbackDataService, 'getData').and.returnValue(of(fallbackData));
      const spyStoreDispatch = spyOn(store, 'dispatch').and.callThrough();

      resolverFallbackService.resolve().subscribe((response) => {
        expect(response['fallbackData']).toEqual(fallbackData);
        expect(spyStoreDispatch).toHaveBeenCalled();
      });
    })
  );

  it('should resolve data when data is in Store', waitForAsync(() => {
      spyOn(store, 'selectSnapshot').and.returnValue(fallbackData);
      resolverFallbackService.resolve().subscribe((response) => {
        expect(response).toEqual(fallbackData);
      });
    })
  );
});
