import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class APIInterfaceService {
  constructor(private http: HttpClient) {}

  get<T>(url: string, params?: HttpParams): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${environment.baseUrl}${url}`, {
      params,
    });
  }

  post<T>(
    url: string,
    data: any,
    params?: HttpParams,
  ): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(
      `${environment.baseUrl}${url}`,
      data,
      { params },
    );
  }

  put<T>(
    url: string,
    data: any,
    headers?: HttpHeaders,
  ): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${environment.baseUrl}${url}`, data, {
      headers,
    });
  }

  patch<T>(
    url: string,
    data: any,
    headers?: HttpHeaders,
    params?: HttpParams,
  ): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(
      `${environment.baseUrl}${url}`,
      data,
      { headers, params },
    );
  }

  delete<T>(url: string, params?: HttpParams): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${environment.baseUrl}${url}`, {
      params,
    });
  }
}
