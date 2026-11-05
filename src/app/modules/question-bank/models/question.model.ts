export interface Category {
  id: number;
  name: string;
}

export interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedTime: number;
  isActive: boolean;
  categories: Category[];
  solutions: QuestionSolution[];
  designations: string[];
}

export interface QuestionSolution {
  language: string;
  solutionCode: string;
}

export interface DuplicateQuestion {
  title?: string;
  description?: string;
  reason?: string;
}

export interface QuestionSimilarityResult {
  isASimilarQuestion: boolean;
  isUnique: boolean;
  reason?: string;
  duplicateQuestions: DuplicateQuestion[];
  redundantQuestions: DuplicateQuestion[];
}

export interface BulkUploadConflictItem {
  questionNumber?: number;
  rowNumber?: number;
  title?: string;
  message: string;
}

export interface BulkUploadDialogData {
  title?: string;
  conflicts: BulkUploadConflictItem[];
}
