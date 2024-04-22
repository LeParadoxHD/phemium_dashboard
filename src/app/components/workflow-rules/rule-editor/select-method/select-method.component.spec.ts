import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMethodComponent } from './select-method.component';

describe('SelectTriggerComponent', () => {
  let component: SelectMethodComponent;
  let fixture: ComponentFixture<SelectMethodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectMethodComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
