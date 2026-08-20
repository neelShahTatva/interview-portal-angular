import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Category,
  Question,
  QuestionSolution,
} from '../../interfaces/question.interfase';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { QuestionService } from '../../services/question-service';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-question-bank-form',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    ReactiveFormsModule,
  ],
  templateUrl: './question-bank-form.component.html',
  styleUrl: './question-bank-form.component.scss',
})
export class QuestionBankFormComponent {
  questionForm!: FormGroup;
  isEditMode = false;
  submitted = false;
  question: Question | null = null;

  difficulties = ['EASY', 'MEDIUM', 'HARD'];

  availableLanguages: string[] = ['Java', 'Python', 'JavaScript', 'C++', 'Go'];

  designations: string[] = [
    'TSE',
    'ASE',
    'SE',
    'SSE',
    'TL',
    'STL',
    'APM',
    'PM',
    'PPM',
  ];

  allCategories: Category[] = [];

  activeSolutionIndex = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private readonly questionService: QuestionService,
    private readonly toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('questionId');
    if (id) {
      this.isEditMode = true;
      this.loadQuestion(Number(id));
    }
  }

  buildForm(): void {
    this.questionForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      difficulty: ['', Validators.required],
      estimatedTime: [null, [Validators.required, Validators.min(1)]],
      designations: [[], [CustomValidators.minLengthArray(1)]],
      isActive: [true],
      solutions: this.fb.array([], [CustomValidators.minLengthArray(1)]),
      categories: [[], [CustomValidators.minLengthArray(1)]],
    });
  }

  get solutions(): FormArray {
    return this.questionForm.get('solutions') as FormArray;
  }

  get categoriesControl() {
    return this.questionForm.get('categories')!;
  }

  loadCategories(): void {
    this.questionService.getCategories().subscribe({
      next: (response: any) => {
        this.allCategories = response.result;
      },
      error: () => {
        this.toastr.error('Failed to load categories');
      },
    });
  }

  loadQuestion(id: number): void {
    this.questionService.getQuestionbyId(id).subscribe({
      next: (response: any) => {
        this.question = response.result;

        this.questionForm.patchValue({
          title: response.result.title,
          description: response.result.description,
          difficulty: response.result.difficulty,
          estimatedTime: response.result.estimatedTime,
          isActive: response.result.isActive,
          designations: response.result.designations || [],
          categories: response.result.categories || [],
        });

        const solutionsFormArray = this.solutions;

        solutionsFormArray.clear();

        if (response.result.solutions && response.result.solutions.length > 0) {
          response.result.solutions.forEach((sol: QuestionSolution) => {
            solutionsFormArray.push(
              this.fb.group({
                language: [sol.language, Validators.required],
                solutionCode: [sol.solutionCode, Validators.required],
              }),
            );
          });

          this.activeSolutionIndex = 0;
        }
      },
      error: (err) => {
        this.toastr.error('Failed to load question details.');
        console.error('Error loading question:', err);

        this.goBack();
      },
    });
  }

  isCategorySelected(id: number): boolean {
    const selected = this.categoriesControl.value as Category[];
    return selected.some((c) => c.id === id);
  }

  toggleCategory(cat: Category): void {
    const selected = [...(this.categoriesControl.value as Category[])];
    const idx = selected.findIndex((c) => c.id === cat.id);
    if (idx >= 0) {
      selected.splice(idx, 1);
    } else {
      selected.push(cat);
    }

    this.categoriesControl.setValue(selected);
    this.categoriesControl.markAsTouched();
  }

  addSolution(): void {
    const solutionForm = this.fb.group({
      language: ['', Validators.required],
      solutionCode: ['', Validators.required],
    });

    this.solutions.push(solutionForm);
    this.activeSolutionIndex = this.solutions.length - 1;
  }

  removeSolution(index: number): void {
    this.solutions.removeAt(index);
    this.activeSolutionIndex = Math.max(
      0,
      Math.min(this.activeSolutionIndex, this.solutions.length - 1),
    );
  }

  isInvalid(field: string): boolean {
    const ctrl = this.questionForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitted);
  }

  onSubmit(): void {
    this.submitted = true;
    this.questionForm.markAllAsTouched();

    if (this.questionForm.invalid) {
      return;
    }

    const payload = {
      ...this.questionForm.value,
      categoryIds: this.categoriesControl.value.map((cat: Category) => cat.id),
      designations: this.designationsControl.value,
    };
    delete payload.categories;

    if (this.isEditMode && this.question?.id) {
      this.updateExistingQuestion(this.question.id, payload);
    } else {
      this.createNewQuestion(payload);
    }
  }

  private createNewQuestion(payload: any): void {
    this.questionService.createQuestion(payload).subscribe({
      next: () => {
        this.toastr.success('Question created successfully!');
        this.goBack();
      },
      error: (err) => {
        this.toastr.error('Failed to create question.');
        console.error('Create error:', err);
      },
    });
  }

  private updateExistingQuestion(id: number, payload: any): void {
    this.questionService.updateQuestion(id, payload).subscribe({
      next: () => {
        this.toastr.success('Question updated successfully!');
        this.goBack();
      },
      error: (err) => {
        this.toastr.error('Failed to update question.');
        console.error('Update error:', err);
      },
    });
  }

  isLanguageDisabled(languageToCheck: string, currentIndex: number): boolean {
    const allSolutions = this.solutions.value;

    return allSolutions.some(
      (sol: any, index: number) =>
        sol.language === languageToCheck && index !== currentIndex,
    );
  }

  triggerFileInput(index: number): void {
    const fileInput = document.getElementById(
      `file-upload-${index}`,
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileUpload(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      // What to do when the file is finished loading
      reader.onload = (e: any) => {
        const fileContent = e.target.result;

        // Find the specific form group in the array
        const solutionGroup = this.solutions.at(index);

        // Patch the text area with the file contents!
        solutionGroup.patchValue({
          solutionCode: fileContent,
        });

        // 🔥 BONUS: Auto-detect the language based on file extension!
        this.autoDetectLanguage(file.name, solutionGroup, index);
      };

      // Read the file as raw text
      reader.readAsText(file);

      // Clear the input so the user can upload the same file again if they want
      input.value = '';
    }
  }

  private autoDetectLanguage(
    filename: string,
    group: any,
    index: number,
  ): void {
    const ext = filename.split('.').pop()?.toLowerCase();
    let detectedLang = '';

    if (ext === 'java') detectedLang = 'Java';
    else if (ext === 'py') detectedLang = 'Python';
    else if (ext === 'js') detectedLang = 'JavaScript';
    else if (ext === 'cpp' || ext === 'cc' || ext === 'c') detectedLang = 'C++';
    else if (ext === 'go') detectedLang = 'Go';

    // Only set it if we found a match AND that language isn't already used elsewhere
    if (detectedLang && !this.isLanguageDisabled(detectedLang, index)) {
      group.patchValue({ language: detectedLang });
    }
  }

  onLanguageChange(index: number): void {
    // 1. Grab the specific form group from the array using the index
    const solutionGroup = this.solutions.at(index);

    // 2. Patch the code value to an empty string!
    solutionGroup.patchValue({
      solutionCode: '',
    });
  }

  goBack(): void {
    this.router.navigate(['/question-bank']);
  }

  get designationsControl() {
    return this.questionForm.get('designations')!;
  }

  isDesignationSelected(designation: string): boolean {
    const selected = this.designationsControl.value as string[];
    return selected.includes(designation);
  }

  toggleDesignation(designation: string): void {
    const selected = [...(this.designationsControl.value as string[])];

    const index = selected.indexOf(designation);

    if (index >= 0) {
      selected.splice(index, 1);
    } else {
      selected.push(designation);
    }

    this.designationsControl.setValue(selected);
    this.designationsControl.markAsTouched();
  }
}
