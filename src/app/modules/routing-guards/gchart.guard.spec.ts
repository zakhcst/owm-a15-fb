import { TestBed } from '@angular/core/testing';

import { GchartGuard } from './gchart.guard';

describe('GchartGuard', () => {
  let guard: GchartGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GchartGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
