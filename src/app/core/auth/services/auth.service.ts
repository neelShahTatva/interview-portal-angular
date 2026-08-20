import { Injectable } from '@angular/core';
import { LoginRequest } from '../interfaces/login-request.interface';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { LoginResponse } from '../interfaces/login-response.interface';
import { APIInterfaceService } from '../../../shared/services/api-interface.service';
import { API_ROUTES } from '../../../shared/common/api-routes';
import { Router } from '@angular/router';
import { TokenClaims } from '../interfaces/token-claims.interface';
import { RegisterRequest } from '../interfaces/register-request.interface';
import { ResetPasswordRequest } from '../interfaces/reset-password-request.interface';
import { ForgotRequest } from '../interfaces/forgot-request.interface';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private apiInterface: APIInterfaceService,
    private router: Router,
  ) {}

  login(formDetails: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.apiInterface.post<LoginResponse>(
      API_ROUTES.AUTH.LOGIN,
      formDetails,
    );
  }

  getRefreshToken(): Observable<ApiResponse<Record<string, string>>> {
    const refreshToken: string = localStorage.getItem('refreshToken') || '';

    const params = new HttpParams().set('refreshToken', refreshToken);

    return this.apiInterface.post<Record<string, string>>(
      API_ROUTES.AUTH.REFRESH,
      null,
      params
    );
  }

  register(formDetails: RegisterRequest) {
    return this.apiInterface.post(API_ROUTES.AUTH.REGISTER, formDetails);
  }

  forgotPassword(formDetails: ForgotRequest) {
    return this.apiInterface.post(API_ROUTES.AUTH.FORGOT_PASSWORD, formDetails);
  }

  resetPassword(formDetails: ResetPasswordRequest) {
    return this.apiInterface.post(API_ROUTES.AUTH.RESET_PASSWORD, formDetails);
  }

  validateResetToken(token: string) {
    return this.apiInterface.get(
      API_ROUTES.AUTH.VALIDATE_RESET_TOKEN + '/' + token,
    );
  }

  isTokenExists(): boolean {
    var token = localStorage?.getItem('accessToken');
    return token != null && token != '' ? true : false;
  }

  taskAfterLogout() {
    this.clearLocalStorageExcept();
    this.router.navigate(['/auth/login']);
  }

  private clearLocalStorageExcept(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  getToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }


  getClaims(): TokenClaims {
    const jwtHelper = new JwtHelperService();
    const decodedToken = jwtHelper.decodeToken(this.getToken());
    return {
      UserId: Number(decodedToken['UserId']),
      RoleId: Number(decodedToken['RoleId']),
      Name: decodedToken['Name'],
      LoginTimeStamp: decodedToken['LoginTimeStamp'],
      IsAdmin: decodedToken['IsAdmin'],
      IsInterviewer: decodedToken['IsInterviewer'],
      RoleName: decodedToken['RoleName'],
    };
  }

  setToken(accessToken: string, refreshToken: string, user?: any) {
    localStorage.setItem('accessToken', accessToken);

    localStorage.setItem('refreshToken', refreshToken);

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser() {
    const user = localStorage.getItem('user');

    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem('accessToken');

    localStorage.removeItem('refreshToken');

    localStorage.removeItem('user');
  }
}
