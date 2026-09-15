import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly apiUrl = 'http://localhost:8080/users';

  constructor(private readonly http: HttpClient) {}

  getUsers() {
    return this.http.get(this.apiUrl);
  }

  createUser(payload: any) {
    return this.http.post(this.apiUrl, payload);
  }

  updateUser(id: number, payload: any) {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getProfile() {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }

  uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/profile/picture`, formData);
  }

  updateProfile(payload: any) {
    return this.http.put<any>(`${this.apiUrl}/profile`, payload);
  }
}
