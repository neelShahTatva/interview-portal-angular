import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { ToastrService } from 'ngx-toastr';

import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { CandidatesService } from '../../../../core/auth/services/candidates.service';
import { CandidateDialogComponent } from '../candidate-dialog/candidate-dialog';

@Component({
  selector: 'app-candidates',
  standalone: true,
  templateUrl: './candidates.component.html',
  styleUrl: './candidates.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
  ],
})
export class CandidatesComponent implements OnInit {

  displayedColumns = [
    'candidate',
    'email',
    'experience',
    'designation',
    'status',
    'actions'
  ];

  candidates: any[] = [];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  searchText = '';
  isLoading = false;
  role = '';

  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    private readonly authService: AuthService,
  ) { }

  ngOnInit(): void {

    this.getCandidates();

    const user = this.authService.getUser();

    if (user) {
      this.role = user.roleName;
    }

    this.displayedColumns = [
      'candidate',
      'email',
      'experience',
      'designation',
      'status',
    ];

    if (this.role === 'ADMIN') {
      this.displayedColumns.push('actions');
    }
  }

  getCandidates(): void {

    this.isLoading = true;

    this.candidatesService.getCandidates().subscribe({

      next: (response: any) => {

        this.isLoading = false;

        this.candidates = response.result;

        this.dataSource.data = response.result;

        this.dataSource.paginator = this.paginator;
      },

      error: () => {
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {

    this.dataSource.filterPredicate =
      (data: any, filter: string) => {

        const search = filter;

        return (
          data.firstName?.toLowerCase().includes(search) ||
          data.lastName?.toLowerCase().includes(search) ||
          data.email?.toLowerCase().includes(search) ||
          data.designation?.toLowerCase().includes(search)
        );
      };

    this.dataSource.filter =
      this.searchText.trim().toLowerCase();

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  deleteCandidate(candidate: any): void {

    const dialogRef = this.dialog.open(
      ConfirmDialogComponent,
      {
        width: '420px',
        disableClose: true,
        data: {
          title:"Candidate",
          name:
            candidate.firstName +
            ' ' +
            candidate.lastName,
        },
      }
    );

    dialogRef.afterClosed()
      .subscribe((confirmed) => {

        if (!confirmed) {
          return;
        }

        this.candidatesService
          .deleteCandidate(candidate.id)
          .subscribe({

            next: () => {

              this.toastr.success(
                'Candidate deleted successfully'
              );

              this.getCandidates();
            },

            error: () => {

              this.toastr.error(
                'Failed to delete candidate'
              );
            },
          });
      });
  }

  openAddDialog(): void {

    const dialogRef = this.dialog.open(
      CandidateDialogComponent,
      {
        width: '520px',
      }
    );

    dialogRef.afterClosed()
      .subscribe((result) => {

        if (!result) return;

        const payload = {
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          experience: result.experience,
          designation: result.designation,
          isActive: result.isActive,
        };

        this.candidatesService
          .createCandidate(payload)
          .subscribe({

            next: () => {

              this.getCandidates();

              this.toastr.success(
                'Candidate created successfully'
              );
            },

            error: () => {

              this.toastr.error(
                'Failed to create candidate'
              );
            },
          });
      });
  }

  openEditDialog(candidate: any): void {

    const dialogRef = this.dialog.open(
      CandidateDialogComponent,
      {
        width: '520px',
        data: {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          experience: candidate.experience,
          designation: candidate.designation,
          isActive: candidate.isActive,
        },
      }
    );

    dialogRef.afterClosed()
      .subscribe((result) => {

        if (!result) return;

        const payload = {
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          experience: result.experience,
          designation: result.designation,
          isActive: result.isActive,
        };

        this.candidatesService
          .updateCandidate(candidate.id, payload)
          .subscribe({

            next: () => {

              this.getCandidates();

              this.toastr.success(
                'Candidate updated successfully'
              );
            },

            error: () => {

              this.toastr.error(
                'Failed to update candidate'
              );
            },
          });
      });
  }
}