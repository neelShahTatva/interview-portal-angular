import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { ToastrService } from 'ngx-toastr';

import { CandidateDialogComponent } from '@modules/candidates/components';
import { ConfirmDialogComponent } from '@shared/components';
import { AuthService } from '@core/auth/services';
import { CandidatesService } from '@modules/candidates/services';
import { ButtonComponent } from '@shared/components';
import { GridComponent } from '@shared/components/grid';
import {
  GridAction,
  GridColumn,
  GridConfig,
} from '@shared/components/grid/models';
import { Candidate } from '@modules/candidates/models';

@Component({
  selector: 'app-candidates',
  standalone: true,
  templateUrl: './candidates.component.html',
  styleUrl: './candidates.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    ButtonComponent,
    GridComponent,
  ],
})
export class CandidatesComponent implements OnInit {
  readonly columns: readonly GridColumn<Candidate>[] = [
    {
      key: 'firstName',
      header: 'Candidate',
      type: 'title',
      width: '30%',
      formatter: (_value, candidate) =>
        `${candidate.firstName} ${candidate.lastName}`.trim(),
      secondaryKey: 'email',
      showSecondaryIcon: false,
      leadingText: (candidate) => candidate.firstName?.charAt(0).toUpperCase(),
      leadingClass: 'grid-title-avatar',
    },
    { key: 'email', header: 'Email', width: '24%' },
    {
      key: 'experience',
      header: 'Experience',
      width: '12%',
      formatter: (value) => `${value ?? 0} Years`,
    },
    { key: 'designation', header: 'Designation', width: '13%' },
    {
      key: 'isActive',
      header: 'Status',
      type: 'badge',
      width: '11%',
      formatter: (value) => (value ? 'Active' : 'Inactive'),
      badgeClass: (candidate) =>
        candidate.isActive ? 'grid-badge--success' : 'grid-badge--danger',
    },
  ];

  readonly actions: readonly GridAction<Candidate>[] = [
    { id: 'edit', icon: 'edit', tooltip: 'Edit candidate' },
    {
      id: 'delete',
      icon: 'delete',
      tooltip: 'Delete candidate',
      class: 'delete-action',
    },
  ];

  candidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  pagedCandidates: Candidate[] = [];
  pageIndex = 0;
  pageSize = 5;

  searchText = '';
  isLoading = false;
  role = '';

  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getCandidates();

    const user = this.authService.getUser();

    if (user) {
      this.role = user.roleName;
    }
  }

  getCandidates(): void {
    this.isLoading = true;

    this.candidatesService.getCandidates().subscribe({
      next: (response: any) => {
        this.isLoading = false;

        this.candidates = response.result ?? [];
        this.applyFilters();
      },

      error: () => {
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredCandidates = this.candidates.filter((candidate) =>
      [
        candidate.firstName,
        candidate.lastName,
        candidate.email,
        candidate.designation,
      ].some((value) => value?.toLowerCase().includes(search))
    );

    this.pageIndex = 0;
    this.updatePagedCandidates();
  }

  onPageChanged(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedCandidates();
  }

  onGridAction({
    action,
    row,
  }: {
    action: GridAction<Candidate>;
    row: Candidate;
  }): void {
    if (action.id === 'edit') {
      this.openEditDialog(row);
    } else if (action.id === 'delete') {
      this.deleteCandidate(row);
    }
  }

  get gridConfig(): GridConfig {
    return {
      pagination: true,
      pageSize: this.pageSize,
      pageSizeOptions: [5, 10, 20],
      totalRecords: this.filteredCandidates.length,
      loading: this.isLoading,
      emptyMessage: 'No candidates found.',
      showActions: this.role === 'ADMIN',
    };
  }

  private updatePagedCandidates(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedCandidates = this.filteredCandidates.slice(
      start,
      start + this.pageSize
    );
  }

  deleteCandidate(candidate: Candidate): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      disableClose: true,
      data: {
        title: 'Candidate',
        name: candidate.firstName + ' ' + candidate.lastName,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.candidatesService.deleteCandidate(candidate.id).subscribe({
        next: () => {
          this.toastr.success('Candidate deleted successfully');

          this.getCandidates();
        },

        error: () => {
          this.toastr.error('Failed to delete candidate');
        },
      });
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(CandidateDialogComponent, {
      width: '520px',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const payload = {
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        experience: result.experience,
        designation: result.designation,
        isActive: result.isActive,
      };

      this.candidatesService.createCandidate(payload).subscribe({
        next: () => {
          this.getCandidates();

          this.toastr.success('Candidate created successfully');
        },

        error: () => {
          this.toastr.error('Failed to create candidate');
        },
      });
    });
  }

  openEditDialog(candidate: Candidate): void {
    const dialogRef = this.dialog.open(CandidateDialogComponent, {
      width: '520px',
      autoFocus: false,
      data: {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        experience: candidate.experience,
        designation: candidate.designation,
        isActive: candidate.isActive,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const payload = {
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        experience: result.experience,
        designation: result.designation,
        isActive: result.isActive,
      };

      this.candidatesService.updateCandidate(candidate.id, payload).subscribe({
        next: () => {
          this.getCandidates();

          this.toastr.success('Candidate updated successfully');
        },

        error: () => {
          this.toastr.error('Failed to update candidate');
        },
      });
    });
  }
}
