import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { AssessmentService } from '../../services/assessment.service';
import { Assessment, AssessmentRequest } from '../../interfaces/assessment';
import { Question } from '../../../question-bank/interfaces/question.interfase';
import { CandidatesService } from '../../../../core/auth/services/candidates.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  FileText,
  AlignLeft,
} from 'lucide-angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assessments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss'],
})
export class AssessmentsComponent implements OnInit {
  assessments: Assessment[] = [];

  candidates: any[] = [];

  recommendedQuestions: Question[] = [];

  isLoading = false;

  isGeneratingQuestions = false;

  isCreatingAssessment = false;

  open = false;

  step = 1;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly FileText = FileText;
  readonly AlignLeft = AlignLeft;
  draft = {
    candidateId: null as number | null,
    title: '',
    timeLimitMinutes: 90,
    questionIds: [] as number[],
  };

  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly toastr: ToastrService,
    private readonly candidatesService: CandidatesService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;

    forkJoin({
      assessments: this.assessmentService.getAll(),
      candidates: this.candidatesService.getCandidates(),
    }).subscribe({
      next: ({ assessments, candidates }) => {
        this.assessments = assessments.result ?? [];

        this.candidates = candidates.result ?? [];

        this.isLoading = false;
      },

      error: () => {
        this.isLoading = false;

        this.toastr.error('Failed to load assessments');
      },
    });
  }

  openModal(): void {
    this.resetDraft();

    this.open = true;
  }

  closeModal(): void {
    this.open = false;

    this.resetDraft();
  }

  private resetDraft(): void {
    this.step = 1;

    this.recommendedQuestions = [];

    this.draft = {
      candidateId: null,
      title: '',
      timeLimitMinutes: 90,
      questionIds: [],
    };
  }

  selectCandidate(candidateId: number): void {
    this.draft.candidateId = candidateId;
  }

  isCandidateSelected(candidateId: number): boolean {
    return this.draft.candidateId === candidateId;
  }

  nextStep(): void {
    if (this.step === 1) {
      if (!this.validateStepOne()) {
        return;
      }

      this.generateQuestions();

      return;
    }
  }

  prevStep(): void {
    if (this.step > 1) {
      this.step--;
    }
  }

  private validateStepOne(): boolean {
    if (!this.draft.candidateId) {
      this.toastr.warning('Please select candidate');

      return false;
    }

    if (!this.draft.title.trim()) {
      this.toastr.warning('Assessment title is required');

      return false;
    }

    return true;
  }

  private generateQuestions(): void {
    if (!this.draft.candidateId) {
      return;
    }

    this.isGeneratingQuestions = true;

    this.assessmentService
      .recommendQuestions(this.draft.candidateId, this.draft.timeLimitMinutes)
      .subscribe({
        next: (response: any) => {
          this.recommendedQuestions = response.result ?? [];

          this.draft.questionIds = this.recommendedQuestions.map((q) => q.id);

          this.step = 2;

          this.isGeneratingQuestions = false;
        },

        error: () => {
          this.isGeneratingQuestions = false;

          this.toastr.error('Failed to generate questions');
        },
      });
  }

  createAssessment(): void {
    if (!this.draft.candidateId || this.draft.questionIds.length === 0) {
      this.toastr.warning('No questions selected');

      return;
    }

    const payload: AssessmentRequest = {
      candidateId: this.draft.candidateId,

      title: this.draft.title,

      timeLimitMinutes: this.draft.timeLimitMinutes,

      questionIds: this.draft.questionIds,
    };

    this.isCreatingAssessment = true;

    this.assessmentService.create(payload).subscribe({
      next: () => {
        this.toastr.success('Assessment created successfully');

        this.isCreatingAssessment = false;

        this.closeModal();

        this.loadData();
      },

      error: (err: any) => {
        this.isCreatingAssessment = false;

        const errorMessage = Array.isArray(err?.error?.errorMessages)
          ? err.error.errorMessages.join(', ')
          : err?.error?.errorMessages || 'Failed to create assessment';

        this.toastr.error(errorMessage);
      },
    });
  }

  changeStatus(assessment: Assessment, status: string): void {
    if (assessment.status === status) {
      return;
    }

    this.assessmentService.updateStatus(assessment.id, status).subscribe({
      next: () => {
        assessment.status = status;

        this.toastr.success('Status updated successfully');
      },

      error: () => {
        this.toastr.error('Failed to update status');
      },
    });
  }

  deleteAssessment(assessmentId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed)
        this.assessmentService.delete(assessmentId).subscribe({
          next: () => {
            this.toastr.success('Assessment deleted successfully');

            this.loadData();
          },

          error: () => {
            this.toastr.error('Failed to delete assessment');
          },
        });
    });
  }

  private loadAssessments(): void {
    this.assessmentService.getAll().subscribe({
      next: (response: any) => {
        this.assessments = response.result ?? [];
      },

      error: () => {
        this.toastr.error('Failed to refresh assessments');
      },
    });
  }

  getCandidateName(candidateId: number): string {
    const candidate = this.candidates.find((c) => c.id === candidateId);

    if (!candidate) {
      return 'Unknown Candidate';
    }

    return `${candidate.firstName} ${candidate.lastName}`;
  }

  getQuestionCount(assessment: Assessment): number {
    return assessment.questions?.length ?? 0;
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'badge pending';

      case 'IN_PROGRESS':
        return 'badge progress';

      case 'COMPLETED':
        return 'badge completed';

      default:
        return 'badge';
    }
  }

  trackByAssessment(index: number, item: Assessment): number {
    return item.id;
  }

  trackByCandidate(index: number, item: any): number {
    return item.id;
  }

  trackByQuestion(index: number, item: Question): number {
    return item.id;
  }
}
