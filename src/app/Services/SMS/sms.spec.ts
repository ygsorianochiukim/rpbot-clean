import { TestBed } from '@angular/core/testing';

import { Sms } from './sms';

describe('Sms', () => {
  let service: Sms;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sms);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
