import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { Category, Question } from '../interfaces/question.interfase';
import { APIInterfaceService } from '../../../shared/services/api-interface.service';
import { API_ROUTES } from '../../../shared/common/api-routes';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {

  constructor(
    private apiInterface: APIInterfaceService) { }

  getQuestions(): Observable<ApiResponse<Question[]>> {
    return this.apiInterface.get<Question[]>(API_ROUTES.QUESTIONS.GET_ALL);
  }

  getQuestionbyId(id: number): Observable<ApiResponse<Question>> {
    return this.apiInterface.get<Question>(`${API_ROUTES.QUESTIONS.GET_BY_ID}${id}`);
  }

  createQuestion(payload: any): Observable<ApiResponse<string>> {
    return this.apiInterface.post<string>(
      API_ROUTES.QUESTIONS.CREATE,
      payload
    );
  }

  updateQuestion(
    id: number,
    payload: any
  ): Observable<ApiResponse<string>> {
    return this.apiInterface.put<string>(
      `${API_ROUTES.QUESTIONS.UPDATE}${id}`,
      payload
    );
  }

  deleteQuestion(id: number): Observable<ApiResponse<string>> {
    return this.apiInterface.delete<string>(`${API_ROUTES.QUESTIONS.DELETE}${id}`);
  }

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.apiInterface.get<Category[]>(API_ROUTES.QUESTIONS.GET_ALL_CATEGORIES);
  }

  uploadQuestions(file: File) {

    const formData = new FormData();

    formData.append('file', file);

    return this.apiInterface.post<ApiResponse<Question[]>>(API_ROUTES.QUESTIONS.UPLOAD,formData);
  }

}
