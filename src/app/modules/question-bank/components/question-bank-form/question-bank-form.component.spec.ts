import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionBankFormComponent } from './question-bank-form.component';

describe('QuestionBankFormComponent', () => {
  let component: QuestionBankFormComponent;
  let fixture: ComponentFixture<QuestionBankFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionBankFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionBankFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
