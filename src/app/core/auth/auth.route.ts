import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',

    loadComponent: () =>
      import('./components/login/login').then((m) => m.Login),
  },

  // {
  //   path: 'register',
  //   loadComponent: () =>
  //     import('./components/register/register.component').then(
  //       (m) => m.Register,
  //     ),
  // },

  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./components/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPassword,
      ),
  },

  {
    path: 'reset-password/:token',
    loadComponent: () =>
      import('./components/reset-password/reset-password.component').then(
        (m) => m.ResetPassword,
      ),
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
