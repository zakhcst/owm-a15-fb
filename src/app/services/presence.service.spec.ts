import { TestBed } from '@angular/core/testing';
import { AppModule } from '../app.module';

import { PresenceService } from './presence.service';

describe('PresenceService', () => {
  let service: PresenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ AppModule ]
    });
    service = TestBed.inject(PresenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
