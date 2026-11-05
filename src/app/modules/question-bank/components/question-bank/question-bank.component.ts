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
import { Category, Question, BulkUploadConflictItem } from '@modules/question-bank/models';
import { BulkUploadConflictDialogComponent } from '../bulk-upload-conflict-dialog/bulk-upload-conflict-dialog.component';
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
      pageIndex: this.pageIndex,
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
      next: (response: any) => {
        const count = response?.result?.length ?? 0;
        this.toastr.success(
          count > 0
            ? `${count} questions uploaded successfully!`
            : 'Questions uploaded successfully!'
        );
        this.getQuestions();
        event.target.value = '';
      },
      error: (err: HttpErrorResponse) => {
        let rawMessages: string[] = [];

        const rawError = err?.error;

        if (typeof rawError === 'string') {
          try {
            const parsed = JSON.parse(rawError);
            if (
              Array.isArray(parsed?.errorMessages) &&
              parsed.errorMessages.length
            ) {
              rawMessages = parsed.errorMessages;
            } else if (parsed?.message) {
              rawMessages = [parsed.message];
            } else {
              rawMessages = [rawError];
            }
          } catch {
            rawMessages = [rawError || err?.message || 'Upload failed'];
          }
        } else if (rawError) {
          if (
            Array.isArray(rawError.errorMessages) &&
            rawError.errorMessages.length
          ) {
            rawMessages = rawError.errorMessages;
          } else if (Array.isArray(rawError.errors) && rawError.errors.length) {
            rawMessages = rawError.errors;
          } else if (Array.isArray(rawError.result) && rawError.result.length) {
            rawMessages = rawError.result;
          } else if (rawError.message) {
            rawMessages = [rawError.message];
          }
        }

        if (rawMessages.length === 0) {
          rawMessages = [err?.message || 'Upload failed'];
        }

        // Pattern: Question {questionNumber} (Row {rowNumber}): {message}
        const BULK_ERROR_PATTERN =
          /^Question\s+(\d+)\s+\(Row\s+(\d+)\):\s*(.+)$/i;
        const TITLE_PATTERN =
          /(?:question|of)\s*[:\(]?\s*["']([^"']+)["']/i;

        const conflictItems: BulkUploadConflictItem[] = [];

        for (const raw of rawMessages) {
          const lines = String(raw).split(/\s*\|\s*/);
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const match = trimmed.match(BULK_ERROR_PATTERN);
            if (match) {
              const questionNumber = Number(match[1]);
              const rowNumber = Number(match[2]);
              const message = match[3]?.trim();
              const titleMatch = message.match(TITLE_PATTERN);
              const title = titleMatch ? titleMatch[1] : undefined;

              conflictItems.push({
                questionNumber,
                rowNumber,
                title,
                message,
              });
            } else {
              conflictItems.push({
                message: trimmed,
              });
            }
          }
        }

        // Open interactive conflict dialog with manual close (no error toaster)
        this.dialog.open(BulkUploadConflictDialogComponent, {
          width: '620px',
          maxWidth: '92vw',
          maxHeight: '90vh',
          data: {
            title: 'Bulk Upload Conflicts',
            conflicts: conflictItems,
          },
        });

        event.target.value = '';
      },
    });
  }
}
