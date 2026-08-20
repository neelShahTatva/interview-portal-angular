import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionPreviewDialog } from './solution-preview-dialog';

describe('SolutionPreviewDialog', () => {
  let component: SolutionPreviewDialog;
  let fixture: ComponentFixture<SolutionPreviewDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolutionPreviewDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolutionPreviewDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
