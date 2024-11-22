import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { resetPassGuard } from './reset-pass.guard';

describe('resetPassGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => resetPassGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
