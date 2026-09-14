import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { API_ROUTES } from '@shared/constant';
import { RoleModel } from '@shared/models/';

@Injectable({
  providedIn: 'root',
})
export class Roles {
  private baseUrl = environment.baseUrl;

  private http = inject(HttpClient);

  getRoles(): Observable<RoleModel[]> {
    return this.http.get<RoleModel[]>(
      `${this.baseUrl}${API_ROUTES.COMMON.GET_ALL_ROLES}`
    );
  }
}
