import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import {
  ActivityItem,
  AiScoreDistribution,
  AssessmentStatusBreakdown,
  CandidatePipeline,
  DashboardData,
  DashboardStats,
  QuestionsByDifficulty,
  RecentSubmission,
} from '../interfaces/dashboard.interface';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  private readonly apiUrl = 'http://localhost:8080/api/dashboard';

  constructor(private readonly http: HttpClient) { }

  getStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/stats`);
  }

  getAssessmentStatusBreakdown(days = 30): Observable<ApiResponse<AssessmentStatusBreakdown[]>> {
    const params = new HttpParams().set('days', days);
    return this.http.get<ApiResponse<AssessmentStatusBreakdown[]>>(`${this.apiUrl}/assessment-status`, { params });
  }

  getCandidatePipeline(): Observable<ApiResponse<CandidatePipeline>> {
    return this.http.get<ApiResponse<CandidatePipeline>>(`${this.apiUrl}/candidate-pipeline`);
  }

  getRecentSubmissions(limit = 5): Observable<ApiResponse<RecentSubmission[]>> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<ApiResponse<RecentSubmission[]>>(`${this.apiUrl}/recent-submissions`, { params });
  }

  getQuestionsByDifficulty(): Observable<ApiResponse<QuestionsByDifficulty[]>> {
    return this.http.get<ApiResponse<QuestionsByDifficulty[]>>(`${this.apiUrl}/questions-by-difficulty`);
  }

  getAiScoreDistribution(): Observable<ApiResponse<AiScoreDistribution[]>> {
    return this.http.get<ApiResponse<AiScoreDistribution[]>>(`${this.apiUrl}/ai-score-distribution`);
  }

  getRecentActivity(limit = 5): Observable<ApiResponse<ActivityItem[]>> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<ApiResponse<ActivityItem[]>>(`${this.apiUrl}/recent-activity`, { params });
  }

  loadAll(): Observable<DashboardData> {
    return forkJoin({
      stats: this.getStats().pipe(map((r) => r.result!)),
      assessmentStatusBreakdown: this.getAssessmentStatusBreakdown().pipe(map((r) => r.result!)),
      candidatePipeline: this.getCandidatePipeline().pipe(map((r) => r.result!)),
      recentSubmissions: this.getRecentSubmissions().pipe(map((r) => r.result!)),
      questionsByDifficulty: this.getQuestionsByDifficulty().pipe(map((r) => r.result!)),
      aiScoreDistribution: this.getAiScoreDistribution().pipe(map((r) => r.result!)),
      recentActivity: this.getRecentActivity().pipe(map((r) => r.result!)),
    });
  }
}