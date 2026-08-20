import { Routes } from '@angular/router';
import { Layout } from './layout/layout.component';
import { AuthGuard } from './auth/AuthGuard';

export const coreRoutes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard()],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../modules/dashboard/components/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },

      {
        path: 'users',
        loadComponent: () =>
          import('../modules/users/components/users/users.component').then(
            (m) => m.UsersComponent,
          ),
      },

      {
        path: 'question-bank',
        loadChildren: () =>
          import('../modules/question-bank/question-bank.route').then(
            (m) => m.questionBankRoutes,
          ),
      },

      {
        path: 'candidates',
        loadComponent: () =>
          import('../modules/candidates/components/candidates/candidates.component').then(
            (m) => m.CandidatesComponent,
          ),
      },

      {
        path: 'assessments',
        loadComponent: () =>
          import('../modules/assessments/components/assessments/assessments.component').then(
            (m) => m.AssessmentsComponent,
          ),
      },
      {
        path: 'evaluations',
        loadComponent: () =>
          import('../modules/evaluations/components/evaluations/evaluations.component').then(
            (m) => m.EvaluationsComponent,
          ),
      },

      {
        path: 'submissions',
        loadComponent: () =>
          import('../modules/file-submission/components/file-submission/file-submission.component').then(
            (m) => m.FileSubmissionsComponent,
          ),
      },

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
