import { TestBed } from '@angular/core/testing';

import { BrowerService } from './browser/browser.service';

describe('BrowerService', () => {
  let service: BrowerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
