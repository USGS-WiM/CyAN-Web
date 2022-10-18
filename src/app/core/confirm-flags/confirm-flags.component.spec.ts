import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmFlagsComponent } from './confirm-flags.component';

describe('ConfirmFlagsComponent', () => {
  let component: ConfirmFlagsComponent;
  let fixture: ComponentFixture<ConfirmFlagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmFlagsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmFlagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
