import { Routes } from '@angular/router';

export const submissionRoutes: Routes = [
  {
    path: 'file-submission',
    loadComponent: () =>
      import('./components/file-submission/file-submission.component').then(
        (m) => m.FileSubmissionsComponent,
      ),
  },
];
