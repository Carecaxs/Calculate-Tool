import { TestBed } from '@angular/core/testing';

import { TablaPorcetajesService } from './tabla-porcetajes.service';

describe('TablaPorcetajesService', () => {
  let service: TablaPorcetajesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TablaPorcetajesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
