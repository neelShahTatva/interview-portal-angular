export interface Submission {
  id: number;
  assessmentId?: number;
  assessmentName?: string;
  candidateFileId?: number;
  candidateName: string;
  output?: string;
  aiScore?: number;
  aiFeedback?: string;
  evaluatedAt?: string | Date;
}
