import { Component, ViewChild } from '@angular/core';
import { Category, Question } from '../../interfaces/question.interfase';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatPaginatorModule } from '@angular/material/paginator';
import { QuestionService } from '../../services/question-service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { ApiResponse } from '../../../../shared/interfaces/api-response.interface';

@Component({
  selector: 'app-question-bank',
  imports: [CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule
  ],
  templateUrl: './question-bank.component.html',
  styleUrl: './question-bank.component.scss'
})
export class QuestionBankComponent {

  displayedColumns: string[] = ['title', 'difficulty', 'categories', 'designations', 'status', 'actions'];

  dataSource = new MatTableDataSource<Question>([]);

  allCategories: Category[] = [];

  searchText = '';
  difficultyFilter = '';
  categoryFilter = '';
  statusFilter = '';

  isLoading = false;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(
    private readonly questionService: QuestionService,
    private readonly dialog: MatDialog,
    private readonly toastr: ToastrService,
    private readonly router: Router,
    private activateRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getCategories();
    this.getQuestions();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  getQuestions(): void {
    this.isLoading = true;

    this.questionService.getQuestions().subscribe({
      next: (response: ApiResponse<Question[]>) => {
        this.isLoading = false;
        if (response.result) {
          this.dataSource.data = response.result;
          this.dataSource.paginator = this.paginator;
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load questions');
      },
    });
  }

  getCategories(): void {
    this.questionService.getCategories().subscribe({
      next: (response: any) => {
        this.allCategories = response.result;
      },
      error: () => {
        this.toastr.error('Failed to load categories');
      },
    });
  }

  applyFilters(): void {
    this.dataSource.filterPredicate = (data: Question, filter: string) => {
      const parsed = JSON.parse(filter);

      const matchesSearch =
        !parsed.search ||
        data.title?.toLowerCase().includes(parsed.search);

      const matchesDifficulty =
        !parsed.difficulty ||
        data.difficulty === parsed.difficulty;

      const matchesCategory =
        !parsed.category ||
        data.categories?.some((c) => c.id === Number(parsed.category));

      const matchesStatus =
        parsed.status === '' ||
        data.isActive === (parsed.status === 'true');

      return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus;
    };

    this.dataSource.filter = JSON.stringify({
      search: this.searchText.trim().toLowerCase(),
      difficulty: this.difficultyFilter,
      category: this.categoryFilter,
      status: this.statusFilter,
    });

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  openAddPage(): void {
    this.router.navigate(['./add'], {
      relativeTo: this.activateRoute,
    });
  }

  openEditPage(question: Question): void {
    this.router.navigate(['./edit/', question.id], {
      relativeTo: this.activateRoute,
    });
  }

  deleteQuestion(question: Question): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      disableClose: true,
      data: { title: "Question", name: question.title },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.questionService.deleteQuestion(question.id).subscribe({
        next: () => {
          this.toastr.success('Question deleted successfully');
          this.getQuestions();
        },
        error: () => {
          this.toastr.error('Failed to delete question');
        },
      });
    });
  }

  uploadExcel(event: any): void {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    this.questionService.uploadQuestions(file).subscribe({
      next: () => {
        this.toastr.success('Questions uploaded successfully');
        this.getQuestions();
        event.target.value = '';
      },
      error: () => {
        this.toastr.error('Upload failed');
      }
    });

  }
}
