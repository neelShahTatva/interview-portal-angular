import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@shared/models';
import { Submission } from '@modules/file-submission/models';

@Injectable({
  providedIn: 'root',
})
export class SubmissionService {
  private apiUrl = 'http://localhost:8080/submissions';

  constructor(private readonly http: HttpClient) {}

  getSubmissions(): Observable<ApiResponse<Submission[]>> {
    return this.http.get<ApiResponse<Submission[]>>(this.apiUrl);
  }

  getSubmissionById(id: number): Observable<ApiResponse<Submission>> {
    return this.http.get<ApiResponse<Submission>>(`${this.apiUrl}/${id}`);
  }

  deleteSubmission(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}