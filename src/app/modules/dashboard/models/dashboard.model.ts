export interface DashboardStats {
    totalCandidates: number;
    newCandidatesThisMonth: number;

    totalAssessments: number;
    inProgressAssessments: number;
    pendingAssessments: number;
    completedAssessments: number;

    totalQuestions: number;
    totalCategories: number;

    avgAiScore: number;
    avgAiScoreLastMonth: number;
}

export interface AssessmentStatusBreakdown {
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    count: number;
}

export interface CandidatePipeline {
    totalApplied: number;
    totalAssessed: number;
    totalEvaluated: number;
    totalShortlisted: number;

    byDesignation: DesignationCount[];
}

export interface DesignationCount {
    designation: string;
    count: number;
}

export interface RecentSubmission {
    submissionId: number;
    candidateId: number;
    candidateName: string;
    designation: string;
    language: string;
    aiScore: number;
    evaluatedAt: string;
}

export interface QuestionsByDifficulty {
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    count: number;
}

export interface AiScoreDistribution {
    score: number;
    count: number;
}

export interface ActivityItem {
    type: ActivityType;
    description: string;
    entityName: string;
    timestamp: string;
}

export type ActivityType =
    | 'ASSESSMENT_COMPLETED'
    | 'ASSESSMENT_STARTED'
    | 'CANDIDATE_ADDED'
    | 'AI_EVALUATED'
    | 'QUESTION_ADDED'
    | 'ASSESSMENT_SENT';

export interface DashboardData {
    stats: DashboardStats;
    assessmentStatusBreakdown: AssessmentStatusBreakdown[];
    candidatePipeline: CandidatePipeline;
    recentSubmissions: RecentSubmission[];
    questionsByDifficulty: QuestionsByDifficulty[];
    aiScoreDistribution: AiScoreDistribution[];
    recentActivity: ActivityItem[];
}