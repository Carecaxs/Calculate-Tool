import { TestBed } from '@angular/core/testing';

import { TablaServiceService } from './tabla-service.service';

describe('TablaServiceService', () => {
  let service: TablaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TablaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
