import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CandidateSolutionService {

    private readonly apiUrl = 'http://localhost:8080/candidate-solutions';

    constructor(
        private readonly http: HttpClient
    ) { }

    getBySubmissionId(submissionId: number): Observable<any> {
        return this.http.get(
            `${this.apiUrl}/${submissionId}`
        );
    }
}