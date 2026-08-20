import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from "@angular/material/icon";
import { SolutionPreviewDialogComponent } from '../solution-preview-dialog/solution-preview-dialog';
import { CandidateSolutionService } from '../../../../core/auth/services/candidateSolution.service';

@Component({
  selector: 'app-submission-view-dialog',
  standalone: true,
  templateUrl: './submission-view-dialog.html',
  styleUrl: './submission-view-dialog.scss',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIcon
  ],
})

export class SubmissionViewDialogComponent {

  solutions: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private readonly dialog: MatDialog,
    private readonly candidateSolutionService: CandidateSolutionService
  ) { }

  ngOnInit(): void {

    this.candidateSolutionService
      .getBySubmissionId(this.data.id)
      .subscribe({

        next: (response: any) => {

          this.solutions = response.result;

          console.log(this.solutions);
        }
      });
  }

  viewSolution(solution: any): void {

    this.dialog.open(
      SolutionPreviewDialogComponent,
      {
        width: '1000px',
        maxWidth: '95vw',
        height: '80vh',
        data: solution
      }
    );
  }
}