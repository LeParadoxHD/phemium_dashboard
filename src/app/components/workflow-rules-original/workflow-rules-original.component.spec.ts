import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowRulesOriginalComponent } from './workflow-rules-original.component';

describe('WorkflowRulesOriginalComponent', () => {
  let component: WorkflowRulesOriginalComponent;
  let fixture: ComponentFixture<WorkflowRulesOriginalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowRulesOriginalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkflowRulesOriginalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
