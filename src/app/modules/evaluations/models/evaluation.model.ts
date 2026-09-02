export interface FileSubmissionRequest {
  solutionFile: File | null;
  submissionFile: File | null;
  questionTopic: string;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  timeComplexity: string;
  spaceComplexity: string;
  missedEdgeCases: string[];
  securityIssues: string[];
  optimizedCode: string;
}
export interface QuestionEvaluationResult {
  questionId: number;
  questionNumber: number;
  questionTopic: string;
  score: number;
  feedback: string;
  timeComplexity: string;
  spaceComplexity: string;
  missedEdgeCases: string[];
  securityIssues: string[];
  optimizedCode: string;
}

export interface MultiQuestionEvaluationResult {
  isSuccess: boolean;
  overallScore: number;
  totalQuestions: number;
  evaluations: QuestionEvaluationResult[];
}

export interface SubmissionState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string | null;
  result: MultiQuestionEvaluationResult | null;
}
export interface AssessmentListItem {
  id: number;
  title: string;
  candidateName: string;
}
export interface CandidateListItem {
  id: number;
  candidateName: string;
}

export interface QuestionItem {
  questionId: number;
  questionTopic: string;
  solutionFile: File | null;
  submissionFile: File | null;

  solutionFileName?: string;
  solutionFileId?: number;
}
