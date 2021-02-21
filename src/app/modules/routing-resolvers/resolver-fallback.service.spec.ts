import { TestBed, waitForAsync } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { AppModule } from 'src/app/app.module';
import { OwmFallbackDataService } from 'src/app/services/owm-fallback-data.service';

import { ResolverFallbackService } from './resolver-fallback.service';
import { getNewDataObject } from '../../services/testing.services.mocks';
import { of } from 'rxjs';

describe('ResolverFallbackService', () => {
  let resolverFallbackService: ResolverFallbackService;
  let owmFallbackDataService: OwmFallbackDataService;
  let store: Store;
  let fallbackData: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ AppModule ],
      providers: [ Store, OwmFallbackDataService ],
    });
    resolverFallbackService = TestBed.inject(ResolverFallbackService);
    owmFallbackDataService = TestBed.inject(OwmFallbackDataService);
    store = TestBed.inject(Store);
    fallbackData = getNewDataObject();
  });

  it('should be created', () => {
    expect(resolverFallbackService).toBeTruthy();
  });

  it('should resolve data when data is not in Store and dispatch it', waitForAsync(() => {
      spyOn(store, 'selectSnapshot').and.returnValue(null);
      spyOn(owmFallbackDataService, 'getData').and.returnValue(of(fallbackData));
      const spyStoreDispatch = spyOn(store, 'dispatch').and.callThrough();
      resolverFallbackService.resolve().subscribe((response) => {
        expect(response[0]['fallbackData']).toEqual(fallbackData);
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
