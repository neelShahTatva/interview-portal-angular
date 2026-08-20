import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';


let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('accessToken');

  const authReq = addTokenHeader(req, token);
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {
        return handle401Error(authReq, next, authService, router);
      }

      return throwError(() => error);
    })
  );

};

const addTokenHeader = (request: HttpRequest<any>, token: string | null) => {
  if (token && !request.url.includes('/auth/refresh')) {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return request;
};

const handle401Error = (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
) => {
  if (!isRefreshing) {
    // Lock the refresh process so subsequent 401s don't trigger it again
    isRefreshing = true;
    refreshTokenSubject.next(null); // Reset the queue
    
    // Call your backend to refresh the token 
    // (Assuming authService.getRefreshToken() uses the refresh token from localStorage)
    return authService.getRefreshToken().pipe(
      switchMap((response: any) => {
        
        isRefreshing = false;

        // Extract the new tokens (Adjust these property names based on your .NET API response)
        const newAccessToken = response.result?.token || response.accessToken;

        // Update local storage with the new access token
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
        }

        // Notify all waiting requests that the new token is ready
        refreshTokenSubject.next(newAccessToken);

        // Retry the original request that failed with the new token
        return next(addTokenHeader(request, newAccessToken));
      }),
      catchError((err) => {
        
        // If the refresh token itself is expired, the backend will reject the refresh call.
        // We must log the user out entirely.
        isRefreshing = false;

        // Clear all auth data from local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Redirect to the login page        
        router.navigate(['/auth/login']);

        return throwError(() => err);
      })
    );
  } else {
    

    // If a refresh is already in progress, queue this request until the new token arrives
    return refreshTokenSubject.pipe(
      filter((token) => token !== null), // Wait until the token is not null
      take(1),                           // Take it exactly once and complete the subscription
      switchMap((token) => {
        // Retry the queued request with the newly fetched token
        return next(addTokenHeader(request, token));
      })
    );
  }
};