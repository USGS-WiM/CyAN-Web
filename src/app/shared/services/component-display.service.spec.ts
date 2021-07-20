import { TestBed } from '@angular/core/testing';

import { ComponentDisplayService } from './component-display.service';

describe('ComponentDisplayService', () => {
  let service: ComponentDisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentDisplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
