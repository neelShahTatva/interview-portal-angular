import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionViewDialog } from './submission-view-dialog';

describe('SubmissionViewDialog', () => {
  let component: SubmissionViewDialog;
  let fixture: ComponentFixture<SubmissionViewDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionViewDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmissionViewDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
