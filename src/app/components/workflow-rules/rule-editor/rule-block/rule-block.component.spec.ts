import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleBlockComponent } from './rule-block.component';

describe('RuleBlockComponent', () => {
  let component: RuleBlockComponent;
  let fixture: ComponentFixture<RuleBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleBlockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RuleBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
