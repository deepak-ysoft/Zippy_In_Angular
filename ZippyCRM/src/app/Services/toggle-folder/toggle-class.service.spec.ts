import { TestBed } from '@angular/core/testing';

import { ToggleClassService } from './toggle-class.service';

describe('ToggleClassService', () => {
  let service: ToggleClassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToggleClassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
