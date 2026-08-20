import { Injectable } from '@angular/core';
import { APIInterfaceService } from '../../../shared/services/api-interface.service';
import { Assessment, AssessmentRequest } from '../interfaces/assessment';
import { API_ROUTES } from '../../../shared/common/api-routes';
import { Question } from '../../question-bank/interfaces/question.interfase';

@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
  constructor(private api: APIInterfaceService) {}

  getAll() {
    return this.api.get<Assessment[]>(API_ROUTES.ASSESSMENT.GET_ALL);
  }

  getById(id: number) {
    return this.api.get<Assessment>(`${API_ROUTES.ASSESSMENT.GET_BY_ID}${id}`);
  }

  create(payload: AssessmentRequest) {
    return this.api.post(API_ROUTES.ASSESSMENT.CREATE, payload);
  }

  delete(id: number) {
    return this.api.delete(`${API_ROUTES.ASSESSMENT.DELETE}${id}`);
  }

  updateStatus(id: number, status: string) {
    return this.api.post(
      `${API_ROUTES.ASSESSMENT.CHANGE_STATUS}${id}/status?status=${status}`,
      {},
    );
  }

  getAvailableCandidates() {
    return this.api.get<any>(`${API_ROUTES.ASSESSMENT.AVAILABLE_CANDIDATES}`);
  }

  recommendQuestions(candidateId: number, maxMinutes = 90) {
    return this.api.get<Question[]>(
      `${API_ROUTES.QUESTIONS.RECOMMANDED_QUESTIONS}?candidateId=${candidateId}&maxMinutes=${maxMinutes}`,
    );
  }
}
