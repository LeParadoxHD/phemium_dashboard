import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowRulesEditorComponent } from './workflow-rules-editor.component';

describe('WorkflowRulesEditorComponent', () => {
  let component: WorkflowRulesEditorComponent;
  let fixture: ComponentFixture<WorkflowRulesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowRulesEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkflowRulesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
