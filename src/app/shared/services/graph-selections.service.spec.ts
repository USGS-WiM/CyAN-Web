import { TestBed } from '@angular/core/testing';

import { GraphSelectionsService } from './graph-selections.service';

describe('GraphSelectionsService', () => {
  let service: GraphSelectionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphSelectionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
