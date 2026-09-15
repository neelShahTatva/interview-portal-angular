import { Question } from '@modules/question-bank/models';

export interface Assessment {
  id: number;
  candidateId: number;
  candidateName: string;
  title: string;
  timeLimitMinutes: number;
  status: string;
  questions: Question[];
}

export interface AssessmentRequest {
  candidateId: number;
  title: string;
  timeLimitMinutes: number;
  questionIds: number[];
}
