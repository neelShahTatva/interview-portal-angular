import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivityItem, AiScoreDistribution, AssessmentStatusBreakdown, CandidatePipeline, DashboardData, DashboardStats, QuestionsByDifficulty, RecentSubmission } from '../../interfaces/dashboard.interface';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../services/dashboard-service';
import { ToastrService } from 'ngx-toastr';
import { Subject, of, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @ViewChild('statusChartRef') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('diffChartRef') diffChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('scoreChartRef') scoreChartRef!: ElementRef<HTMLCanvasElement>;

  isLoading = true;

  stats: DashboardStats | null = null;
  pipeline: CandidatePipeline | null = null;
  recentSubmissions: RecentSubmission[] = [];
  questionsByDifficulty: QuestionsByDifficulty[] = [];
  recentActivity: ActivityItem[] = [];

  easyCount = 0;
  mediumCount = 0;
  hardCount = 0;
  totalQuestionsDiff = 0;
  avgScoreDelta = 0;

  private statusChart?: Chart;
  private diffChart?: Chart;
  private scoreChart?: Chart;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.statusChart?.destroy();
    this.diffChart?.destroy();
    this.scoreChart?.destroy();
  }

  loadDashboard(): void {
    this.isLoading = true;

    this.dashboardService.loadAll().pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.isLoading = false;

          this.stats = data.stats;
          this.pipeline = data.candidatePipeline;
          this.recentSubmissions = data.recentSubmissions;
          this.questionsByDifficulty = data.questionsByDifficulty;                                      
          this.recentActivity = data.recentActivity;

          this.deriveCounts();

          this.cdr.detectChanges();

          this.drawStatusChart(data.assessmentStatusBreakdown);
          this.drawDiffChart(data.questionsByDifficulty);
          this.drawScoreChart(data.aiScoreDistribution);
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Failed to load dashboard data');
        },
      });
  }

  private deriveCounts(): void {
    if (this.stats) {
      this.avgScoreDelta = +(
        this.stats.avgAiScore - this.stats.avgAiScoreLastMonth
      ).toFixed(1);
    }

    const easy = this.questionsByDifficulty.find(q => q.difficulty === 'EASY');
    const medium = this.questionsByDifficulty.find(q => q.difficulty === 'MEDIUM');
    const hard = this.questionsByDifficulty.find(q => q.difficulty === 'HARD');
    this.easyCount = easy?.count ?? 0;
    this.mediumCount = medium?.count ?? 0;
    this.hardCount = hard?.count ?? 0;
    this.totalQuestionsDiff = this.easyCount + this.mediumCount + this.hardCount;
  }

  pipelineWidth(value: number): string {
    const total = this.pipeline?.totalApplied ?? 1;
    return Math.round((value / total) * 100) + '%';
  }

  scorePillClass(score: number): string {
    if (score >= 8) return 'score-hi';
    if (score >= 5) return 'score-mid';
    return 'score-lo';
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  avatarClass(index: number): string {
    const classes = ['av1', 'av2', 'av3', 'av4', 'av5'];
    return classes[index % classes.length];
  }

  activityIcon(type: string): string {
    const map: Record<string, string> = {
      ASSESSMENT_COMPLETED: 'clipboard-check',
      ASSESSMENT_STARTED: 'player-play',
      CANDIDATE_ADDED: 'user-plus',
      AI_EVALUATED: 'robot',
      QUESTION_ADDED: 'file-plus',
      ASSESSMENT_SENT: 'send',
    };
    return map[type] ?? 'bell';
  }

  activityIconColor(type: string): string {
    const map: Record<string, string> = {
      ASSESSMENT_COMPLETED: 'blue',
      ASSESSMENT_STARTED: 'green',
      CANDIDATE_ADDED: 'green',
      AI_EVALUATED: 'amber',
      QUESTION_ADDED: 'coral',
      ASSESSMENT_SENT: 'blue',
    };
    return map[type] ?? 'blue';
  }

  relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    return `${Math.floor(hrs / 24)} day ago`;
  }

  private isDark(): boolean {
    return matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private gridColor(): string {
    return this.isDark() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  }

  private tickColor(): string {
    return this.isDark() ? '#aaa' : '#888';
  }

  private drawStatusChart(data: AssessmentStatusBreakdown[]): void {
    if (!this.statusChartRef) return;
    this.statusChart?.destroy();

    const ordered: Array<'COMPLETED' | 'IN_PROGRESS' | 'PENDING'> = ['COMPLETED', 'IN_PROGRESS', 'PENDING'];
    const labels = ['Completed', 'In progress', 'Pending'];
    const colors = ['#185FA5', '#3B6D11', '#888780'];
    const counts = ordered.map(s => data.find(d => d.status === s)?.count ?? 0);

    this.statusChart = new Chart(this.statusChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: counts,
          backgroundColor: colors,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: this.tickColor(), font: { size: 12 } } },
          y: { grid: { color: this.gridColor() }, ticks: { color: this.tickColor(), font: { size: 11 }, stepSize: 10 }, beginAtZero: true },
        },
      },
    });
  }

  private drawDiffChart(data: QuestionsByDifficulty[]): void {
    if (!this.diffChartRef) return;
    this.diffChart?.destroy();

    const ordered: Array<'EASY' | 'MEDIUM' | 'HARD'> = ['EASY', 'MEDIUM', 'HARD'];
    const counts = ordered.map(d => data.find(q => q.difficulty === d)?.count ?? 0);

    this.diffChart = new Chart(this.diffChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [{
          data: counts,
          backgroundColor: ['#3B6D11', '#854F0B', '#A32D2D'],
          borderWidth: 3,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { display: false } },
      },
    });
  }

  private drawScoreChart(data: AiScoreDistribution[]): void {
    if (!this.scoreChartRef) return;
    this.scoreChart?.destroy();

    const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const counts = labels.map(l => data.find(d => d.score === Number(l))?.count ?? 0);

    this.scoreChart = new Chart(this.scoreChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: counts,
          backgroundColor: counts.map((_, i) => {
            if (i <= 2) return '#A32D2D';
            if (i <= 5) return '#854F0B';
            return '#185FA5';
          }),
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: this.tickColor(), font: { size: 12 } },
            title: { display: true, text: 'AI score (1–10)', color: this.tickColor(), font: { size: 11 } },
          },
          y: {
            grid: { color: this.gridColor() },
            ticks: { color: this.tickColor(), font: { size: 11 }, stepSize: 5 },
            beginAtZero: true,
          },
        },
      },
    });
  }
}
