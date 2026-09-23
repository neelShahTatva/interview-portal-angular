import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { SubmissionService } from '@modules/file-submission/services';
import { Submission } from '@modules/file-submission/models';
import { SubmissionViewDialogComponent } from '@modules/file-submission/components';
import { GridComponent } from '@shared/components/grid';
import {
  GridAction,
  GridColumn,
  GridConfig,
} from '@shared/components/grid/models';

@Component({
  selector: 'app-submissions',
  standalone: true,
  templateUrl: './file-submission.component.html',
  styleUrl: './file-submission.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    GridComponent,
  ],
  providers: [DatePipe],
})
export class FileSubmissionsComponent implements OnInit {
  readonly columns: readonly GridColumn<Submission>[] = [
    {
      key: 'candidateName',
      header: 'Candidate',
      type: 'title',
      width: '28%',
      showSecondaryIcon: false,
      leadingIcon: 'person',
    },
    {
      key: 'output',
      header: 'Status',
      type: 'badge',
      width: '18%',
      formatter: (value) => this.formatStatus(value),
      badgeClass: (submission) => this.getStatusBadgeClass(submission.output),
    },
    {
      key: 'aiScore',
      header: 'AI Score',
      type: 'badge',
      width: '18%',
      formatter: (value) =>
        value != null && value !== '' ? `${value}/10` : 'N/A',
      badgeClass: 'grid-badge--primary',
    },
    {
      key: 'evaluatedAt',
      header: 'Evaluated',
      type: 'text',
      width: '24%',
      formatter: (value) => this.formatDate(value),
    },
  ];

  readonly actions: readonly GridAction<Submission>[] = [
    {
      id: 'view',
      icon: 'visibility',
      tooltip: 'View submission details',
    },
  ];

  submissions: Submission[] = [];
  filteredSubmissions: Submission[] = [];
  pagedSubmissions: Submission[] = [];
  pageIndex = 0;
  pageSize = 5;

  searchText = '';
  isLoading = false;

  constructor(
    private readonly submissionService: SubmissionService,
    private readonly dialog: MatDialog,
    private readonly datePipe: DatePipe,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getSubmissions();
  }

  getSubmissions(): void {
    this.isLoading = true;

    this.submissionService.getSubmissions().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.submissions = response.result ?? [];
        this.applyFilters();
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load submissions');
      },
    });
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredSubmissions = this.submissions.filter((submission) => {
      if (!search) {
        return true;
      }

      const searchableText = [
        submission.candidateName,
        submission.assessmentName,
        submission.output,
        submission.aiScore != null ? String(submission.aiScore) : '',
        submission.aiFeedback,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(search);
    });

    this.pageIndex = 0;
    this.updatePagedSubmissions();
  }

  onPageChanged(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedSubmissions();
  }

  onGridAction({
    action,
    row,
  }: {
    action: GridAction<Submission>;
    row: Submission;
  }): void {
    if (action.id === 'view') {
      this.viewSubmission(row);
    }
  }

  get gridConfig(): GridConfig {
    return {
      pagination: true,
      pageSize: this.pageSize,
      pageSizeOptions: [5, 10, 20],
      emptyMessage: 'No submissions found.',
      loading: this.isLoading,
      totalRecords: this.filteredSubmissions.length,
    };
  }

  private updatePagedSubmissions(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedSubmissions = this.filteredSubmissions.slice(
      start,
      start + this.pageSize
    );
  }

  private formatStatus(value: unknown): string {
    const text = String(value ?? '').trim();
    if (!text) {
      return '-';
    }
    return text.toUpperCase();
  }

  private getStatusBadgeClass(output?: string): string {
    const val = output?.trim().toLowerCase();
    if (val === 'pass') {
      return 'grid-badge--success';
    }
    if (val === 'fail') {
      return 'grid-badge--danger';
    }
    return 'grid-badge--neutral';
  }

  private formatDate(value: unknown): string {
    if (!value) {
      return '-';
    }
    return this.datePipe.transform(value as string | Date, 'medium') ?? String(value);
  }

  viewSubmission(submission: Submission): void {
    this.dialog.open(SubmissionViewDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: submission,
    });
  }
}

