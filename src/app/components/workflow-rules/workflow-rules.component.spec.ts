import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowRulesComponent } from './workflow-rules.component';

describe('WorkflowRulesComponent', () => {
  let component: WorkflowRulesComponent;
  let fixture: ComponentFixture<WorkflowRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowRulesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkflowRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
