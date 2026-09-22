import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '@modules/question-bank/services';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog';
import { ApiResponse } from '@shared/models';
import { environment } from 'environments/environment';
import { API_ROUTES } from '@shared/constant';
import { Category, Question } from '@modules/question-bank/models';
import { ButtonComponent } from '@shared/components';
import { GridComponent } from '@shared/components/grid';
import {
  GridAction,
  GridColumn,
  GridConfig,
} from '@shared/components/grid/models';

@Component({
  selector: 'app-question-bank',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    ButtonComponent,
    GridComponent,
  ],
  templateUrl: './question-bank.component.html',
  styleUrl: './question-bank.component.scss',
})
export class QuestionBankComponent {
  readonly columns: readonly GridColumn<Question>[] = [
    {
      key: 'title',
      header: 'Title',
      type: 'title',
      width: '30%',
      secondaryKey: 'estimatedTime',
      leadingIcon: 'help_outline',
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      type: 'badge',
      width: '12%',
      formatter: (value) => this.toTitleCase(value),
      badgeClass: (question) =>
        this.getDifficultyBadgeClass(question.difficulty),
    },
    {
      key: 'categories',
      header: 'Categories',
      type: 'badge',
      width: '20%',
      badgeValues: (question) => this.getCategoryBadges(question),
      badgeClass: 'grid-badge--neutral',
    },
    {
      key: 'designations',
      header: 'Designation',
      type: 'badge',
      width: '20%',
      badgeValues: (question) => this.getDesignationBadges(question),
      badgeClass: 'grid-badge--primary',
    },
    {
      key: 'isActive',
      header: 'Status',
      type: 'badge',
      width: '10%',
      formatter: (value) => (value ? 'Active' : 'Inactive'),
      badgeClass: (question) =>
        question.isActive ? 'grid-badge--success' : 'grid-badge--danger',
    },
  ];

  readonly actions: readonly GridAction<Question>[] = [
    { id: 'edit', icon: 'edit', tooltip: 'Edit question' },
    {
      id: 'delete',
      icon: 'delete',
      tooltip: 'Delete question',
      class: 'delete-action',
    },
  ];

  questions: Question[] = [];
  filteredQuestions: Question[] = [];
  pagedQuestions: Question[] = [];
  pageIndex = 0;
  pageSize = 5;

  allCategories: Category[] = [];

  searchText = '';
  difficultyFilter = '';
  categoryFilter = '';
  statusFilter = '';

  isLoading = false;

  constructor(
    private readonly questionService: QuestionService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    private readonly router: Router,
    private activateRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getCategories();
    this.getQuestions();
  }

  getQuestions(): void {
    this.isLoading = true;

    this.questionService.getQuestions().subscribe({
      next: (response: ApiResponse<Question[]>) => {
        this.isLoading = false;
        if (response.result) {
          this.questions = response.result;
          this.applyFilters();
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load questions');
      },
    });
  }

  getCategories(): void {
    this.questionService.getCategories().subscribe({
      next: (response: any) => {
        this.allCategories = response.result;
      },
      error: () => {
        this.toastr.error('Failed to load categories');
      },
    });
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredQuestions = this.questions.filter((question) => {
      const matchesSearch =
        !search || question.title?.toLowerCase().includes(search);
      const matchesDifficulty =
        !this.difficultyFilter || question.difficulty === this.difficultyFilter;
      const matchesCategory =
        !this.categoryFilter ||
        question.categories?.some(
          (category) => category.id === Number(this.categoryFilter)
        );
      const matchesStatus =
        this.statusFilter === '' ||
        question.isActive === (this.statusFilter === 'true');

      return (
        matchesSearch && matchesDifficulty && matchesCategory && matchesStatus
      );
    });

    this.pageIndex = 0;
    this.updatePagedQuestions();
  }

  onPageChanged(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedQuestions();
  }

  onGridAction({
    action,
    row,
  }: {
    action: GridAction<Question>;
    row: Question;
  }): void {
    if (action.id === 'edit') {
      this.openEditPage(row);
    } else if (action.id === 'delete') {
      this.deleteQuestion(row);
    }
  }

  get gridConfig(): GridConfig {
    return {
      pagination: true,
      pageSize: this.pageSize,
      pageSizeOptions: [5, 10, 20],
      emptyMessage: 'No questions found.',
      loading: this.isLoading,
      totalRecords: this.filteredQuestions.length,
    };
  }

  private updatePagedQuestions(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedQuestions = this.filteredQuestions.slice(
      start,
      start + this.pageSize
    );
  }

  private getCategoryBadges(question: Question): readonly string[] {
    return this.toLimitedBadges(
      question.categories?.map((category) => category.name) ?? []
    );
  }

  private getDesignationBadges(question: Question): readonly string[] {
    return this.toLimitedBadges(question.designations ?? []);
  }

  private toLimitedBadges(values: readonly string[]): readonly string[] {
    const visibleValues = values.slice(0, 3);
    return values.length > 3
      ? [...visibleValues, `+${values.length - 3}`]
      : visibleValues;
  }

  private getDifficultyBadgeClass(
    difficulty: Question['difficulty']
  ): string {
    const classes: Record<Question['difficulty'], string> = {
      EASY: 'grid-badge--success',
      MEDIUM: 'grid-badge--warm',
      HARD: 'grid-badge--danger',
    };

    return classes[difficulty];
  }

  private toTitleCase(value: unknown): string {
    const text = String(value ?? '').toLowerCase();
    return text ? `${text[0].toUpperCase()}${text.slice(1)}` : '';
  }

  openAddPage(): void {
    this.router.navigate(['./add'], {
      relativeTo: this.activateRoute,
    });
  }

  openEditPage(question: Question): void {
    this.router.navigate(['./edit/', question.id], {
      relativeTo: this.activateRoute,
    });
  }

  deleteQuestion(question: Question): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      disableClose: true,
      data: { title: 'Question', name: question.title },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.questionService.deleteQuestion(question.id).subscribe({
        next: () => {
          this.toastr.success('Question deleted successfully');
          this.getQuestions();
        },
        error: () => {
          this.toastr.error('Failed to delete question');
        },
      });
    });
  }

  downloadTemplate(): void {
    const url = `${environment.baseUrl}${API_ROUTES.QUESTIONS.DOWNLOAD_TEMPLATE}`;
    window.open(url, '_blank');
  }

  uploadExcel(event: any): void {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    this.questionService.uploadQuestions(file).subscribe({
      next: () => {
        this.toastr.success('Questions uploaded successfully');
        this.getQuestions();
        event.target.value = '';
      },
      error: (err: HttpErrorResponse) => {
        let message = 'Upload failed';

        const rawError = err?.error;

        if (typeof rawError === 'string') {
          try {
            const parsed = JSON.parse(rawError);
            if (parsed?.errorMessages?.length) {
              message = parsed.errorMessages.join('\n');
            } else if (parsed?.message) {
              message = parsed.message;
            } else {
              message = rawError;
            }
          } catch {
            message = rawError || err?.message || 'Upload failed';
          }
        } else if (rawError) {
          if (
            Array.isArray(rawError.errorMessages) &&
            rawError.errorMessages.length
          ) {
            message = rawError.errorMessages.join('\n');
          } else if (Array.isArray(rawError.errors) && rawError.errors.length) {
            message = rawError.errors.join('\n');
          } else if (Array.isArray(rawError.result) && rawError.result.length) {
            message = rawError.result.join('\n');
          } else if (rawError.message) {
            message = rawError.message;
          }
        }

        if (!message || message === 'Upload failed') {
          message = err?.message || 'Upload failed';
        }

        this.toastr.error(message, 'Upload failed');
        event.target.value = '';
      },
    });
  }
}
