import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  AssessmentListItem,
  CandidateListItem,
  QuestionItem,
  SubmissionState,
} from '../../interfaces/evaluation.mode';
import { EvalutionService } from '../../services/evalution.service';

@Component({
  selector: 'app-file-submission',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './evaluations.component.html',
  styleUrl: './evaluations.component.scss',
})
export class EvaluationsComponent implements OnInit {
  private readonly evaluationService = inject(EvalutionService);

  candidates: CandidateListItem[] = [];

  selectedAssessmentId: number | null = null;
  selectedCandidateId: number | null = null;

  hasNoAssessment = false;

  assessmentTitle = '';

  qs: QuestionItem[] = [];

  submissionState = signal<SubmissionState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    errorMessage: null,
    result: null,
  });

  draggingSolution = signal<Record<number, boolean>>({});
  draggingSubmission = signal<Record<number, boolean>>({});

  ngOnInit(): void {
    this.loadCandidates();
  }

  loadCandidates() {
    this.evaluationService.getCandidates().subscribe({
      next: (res) => {
        this.candidates = res.result.map((x: any) => ({
          id: x.id,

          candidateName: x.firstName + ' ' + x.lastName,
        }));
      },
    });
  }

  onCandidateChange(candidateId: number) {
    this.hasNoAssessment = false;
    this.selectedCandidateId = candidateId;
    this.qs = [];
    this.submissionState.update((s) => ({
      ...s,
      isSuccess: false,
      result: null,
    }));
    this.evaluationService.getCandidateEvaluation(candidateId).subscribe({
      next: (res) => {
        this.selectedAssessmentId = res.assessmentId;
        this.assessmentTitle = res.assessmentTitle;

        if (!res.assessmentId) {
          this.hasNoAssessment = true;
          return;
        }
        if (res.isEvaluated) {
          this.submissionState.update((s) => ({
            ...s,
            isSuccess: true,
            result: res.evaluation,
          }));

          return;
        }
        this.qs = res.questions.map((q: any) => ({
          questionId: q.questionId,
          questionTopic: q.questionTitle,
          solutionFileId: q.solutionFileId,
          solutionFileName: q.solutionFileName,
          solutionFile: null,
          submissionFile: null,
        }));
      },
      error: () => {
        this.hasNoAssessment = true;
      },
    });
  }

  canSubmit(): boolean {
    return (
      this.selectedAssessmentId !== null &&
      this.qs.length > 0 &&
      this.qs.every((q) => q.submissionFile !== null)
    );
  }

  completedCount(): number {
    return this.qs.filter((q) => q.submissionFile).length;
  }

  onFileSelected(
    event: Event,
    index: number,
    type: 'solution' | 'submission',
  ): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.name.endsWith('.java')) {
      this.submissionState.update((s) => ({
        ...s,
        isError: true,
        errorMessage: 'Only .java files are allowed',
      }));

      return;
    }

    if (type === 'solution') {
      this.qs[index].solutionFile = file;
    } else {
      this.qs[index].submissionFile = file;
    }

    this.submissionState.update((s) => ({
      ...s,
      isError: false,
      errorMessage: null,
    }));
  }

  clearFile(index: number, type: 'solution' | 'submission') {
    if (type === 'solution') {
      this.qs[index].solutionFile = null;
    } else {
      this.qs[index].submissionFile = null;
    }
  }

  onDragOver(
    event: DragEvent,
    index: number,
    type: 'solution' | 'submission',
  ): void {
    event.preventDefault();

    this.setDrag(index, type, true);
  }

  onDragLeave(index: number, type: 'solution' | 'submission'): void {
    this.setDrag(index, type, false);
  }

  onDrop(
    event: DragEvent,
    index: number,
    type: 'solution' | 'submission',
  ): void {
    event.preventDefault();

    this.setDrag(index, type, false);

    const file = event.dataTransfer?.files[0];

    if (!file) return;

    if (!file.name.endsWith('.java')) return;

    if (type === 'solution') {
      this.qs[index].solutionFile = file;
    } else {
      this.qs[index].submissionFile = file;
    }
  }

  private setDrag(
    index: number,
    type: 'solution' | 'submission',
    val: boolean,
  ): void {
    if (type === 'solution') {
      this.draggingSolution.update((d) => ({
        ...d,
        [index]: val,
      }));
    } else {
      this.draggingSubmission.update((d) => ({
        ...d,
        [index]: val,
      }));
    }
  }

  onSubmit(): void {
    if (!this.selectedAssessmentId || !this.selectedCandidateId) {
      return;
    }

    this.submissionState.update((s) => ({
      ...s,
      isLoading: true,
    }));

    const formData = new FormData();

    formData.append('totalQuestions', this.qs.length.toString());
    formData.append('assessmentId', this.selectedAssessmentId.toString());
    formData.append('candidateId', this.selectedCandidateId?.toString());

    this.qs.forEach((q, index) => {
      formData.append(`questionId_${index}`, q.questionId.toString());

      if (q.submissionFile) {
        formData.append(`submission_${index}`, q.submissionFile);
      }
    });

    this.evaluationService.evaluateAssessment(formData).subscribe({
      next: (res) => {
        this.submissionState.update((s) => ({
          ...s,
          isLoading: false,
          isSuccess: true,
          result: res,
        }));
      },

      error: () => {
        this.submissionState.update((s) => ({
          ...s,
          isLoading: false,
          isError: true,
          errorMessage: 'Evaluation failed',
        }));
      },
    });
  }

  reset(): void {
    this.selectedCandidateId = null;

    this.assessmentTitle = '';

    this.qs = [];

    this.submissionState.set({
      isLoading: false,
      isSuccess: false,
      isError: false,
      errorMessage: null,
      result: null,
    });
  }

  isDraggingSol(i: number): boolean {
    return this.draggingSolution()[i] ?? false;
  }

  isDraggingSub(i: number): boolean {
    return this.draggingSubmission()[i] ?? false;
  }

  scoreColor(score: number): string {
    if (score >= 75) return '#16a34a';

    if (score >= 50) return '#d97706';

    return '#dc2626';
  }

  scoreLabel(score: number): string {
    if (score >= 75) return 'Strong';

    if (score >= 50) return 'Average';

    return 'Weak';
  }

  formatSize(bytes: number): string {
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  }
}
