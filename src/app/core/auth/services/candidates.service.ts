import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CandidatesService {

  private readonly apiUrl = 'http://localhost:8080/candidates';

  constructor(
    private readonly http: HttpClient
  ) { }

  getCandidates(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  createCandidate(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  updateCandidate(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  deleteCandidate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}