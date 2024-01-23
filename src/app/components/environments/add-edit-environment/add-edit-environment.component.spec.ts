import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditEnvironmentComponent } from './add-edit-environment.component';

describe('NewComponent', () => {
  let component: AddEditEnvironmentComponent;
  let fixture: ComponentFixture<AddEditEnvironmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddEditEnvironmentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditEnvironmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
