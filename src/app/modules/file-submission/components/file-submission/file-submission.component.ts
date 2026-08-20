import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { SubmissionService } from '../../../../core/auth/services/submission.service';
import { SubmissionViewDialogComponent } from '../submission-view-dialog/submission-view-dialog';

@Component({
  selector: 'app-submissions',
  standalone: true,
  templateUrl: './file-submission.component.html',
  styleUrl: './file-submission.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
  ],
})
export class FileSubmissionsComponent implements OnInit {

  displayedColumns = [
    // 'assessmentId',
    'candidateFileId',
    'status',
    'score',
    'evaluatedAt',
    'actions'
  ];

  submissions: any[] = [];

  dataSource =
    new MatTableDataSource<any>();

  searchText = '';

  isLoading = false;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(
    private readonly submissionService: SubmissionService,
    private readonly dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getSubmissions();
  }

  getSubmissions(): void {

    this.isLoading = true;

    this.submissionService
      .getSubmissions()
      .subscribe({

        next: (response: any) => {

          this.isLoading = false;

          this.submissions =
            response.result;

          this.dataSource.data =
            response.result;

          this.dataSource.paginator =
            this.paginator;
        },

        error: () => {
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {

    this.dataSource.filterPredicate =
      (data: any, filter: string) => {

        const searchText = [
          data.assessmentName,
          data.candidateName,
          data.output,
          data.aiScore,
          data.aiFeedback
        ]
          .join(' ')
          .toLowerCase();

        return searchText.includes(filter);
      };

    this.dataSource.filter =
      this.searchText
        .trim()
        .toLowerCase();

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  viewSubmission(submission: any): void {

    this.dialog.open(
      SubmissionViewDialogComponent,
      {
        width: '900px',
        maxWidth: '95vw',
        data: submission,
      }
    );
  }
}