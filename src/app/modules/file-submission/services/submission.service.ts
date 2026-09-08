import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubmissionService {

  private apiUrl =
    'http://localhost:8080/submissions';

  constructor(
    private readonly http: HttpClient
  ) { }

  getSubmissions(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getSubmissionById(id: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${id}`
    );
  }

  deleteSubmission(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}