import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleBlockMultipleComponent } from './rule-block-multiple.component';

describe('RuleBlockMultipleComponent', () => {
  let component: RuleBlockMultipleComponent;
  let fixture: ComponentFixture<RuleBlockMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleBlockMultipleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RuleBlockMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
