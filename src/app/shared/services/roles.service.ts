import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '../constant/api-routes';
import { Observable } from 'rxjs';
import { RoleModel } from '../models/roles.models';

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
