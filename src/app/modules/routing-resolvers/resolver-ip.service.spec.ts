import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';
import { ResolverIpService } from './resolver-ip.service';

describe('ResolverIpService', () => {
  let service: ResolverIpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
    });
    service = TestBed.inject(ResolverIpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve', waitForAsync(() => {
      service.resolve().subscribe((response) => {
        expect(response).toBe(true);
      });
    })
  );

});
