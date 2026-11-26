import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export type UserProfile = 'ADMIN' | 'VETERINARIO' | 'RECEPCIONISTA';

export interface AuthUserInfo {
  username: string;
  roles: string[];
  profile: UserProfile;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_TOKEN_KEY = 'petclinic_auth_token';
  private readonly STORAGE_USER_KEY = 'petclinic_auth_user';
  private readonly STORAGE_PROFILE_KEY = 'petclinic_auth_profile';
  private readonly STORAGE_ROLES_KEY = 'petclinic_auth_roles';

  constructor(private http: HttpClient, private router: Router) {}

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(this.STORAGE_TOKEN_KEY);
  }

  getUsername(): string {
    return sessionStorage.getItem(this.STORAGE_USER_KEY) || '';
  }

  getProfile(): UserProfile {
    return (sessionStorage.getItem(this.STORAGE_PROFILE_KEY) as UserProfile) || 'RECEPCIONISTA';
  }

  getProfileLabel(profile: UserProfile = this.getProfile()): string {
    switch (profile) {
      case 'ADMIN':
        return 'Administrador';
      case 'VETERINARIO':
        return 'Veterinário';
      default:
        return 'Recepcionista';
    }
  }

  getAuthHeader(): string | null {
    const token = sessionStorage.getItem(this.STORAGE_TOKEN_KEY);
    return token ? `Basic ${token}` : null;
  }

  isAdmin(): boolean {
    return this.getProfile() === 'ADMIN';
  }

  isVeterinario(): boolean {
    return this.getProfile() === 'VETERINARIO';
  }

  isRecepcionista(): boolean {
    return this.getProfile() === 'RECEPCIONISTA';
  }

  canManageVets(): boolean {
    return this.isAdmin() || this.isVeterinario();
  }

  login(username: string, password: string): Observable<AuthUserInfo> {
    const cleanUser = username.trim();
    const token = btoa(`${cleanUser}:${password}`);
    const headers = new HttpHeaders({
      Authorization: `Basic ${token}`
    });

    return this.http.get<AuthUserInfo>(`${environment.REST_API_URL}auth/me`, { headers }).pipe(
      tap((info) => {
        sessionStorage.setItem(this.STORAGE_TOKEN_KEY, token);
        sessionStorage.setItem(this.STORAGE_USER_KEY, info.username || cleanUser);
        sessionStorage.setItem(this.STORAGE_PROFILE_KEY, info.profile || 'RECEPCIONISTA');
        sessionStorage.setItem(this.STORAGE_ROLES_KEY, JSON.stringify(info.roles || []));
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(this.STORAGE_USER_KEY);
    sessionStorage.removeItem(this.STORAGE_PROFILE_KEY);
    sessionStorage.removeItem(this.STORAGE_ROLES_KEY);
    this.router.navigate(['/login']);
  }

  listUsers(): Observable<AuthUserInfo[]> {
    return this.http.get<AuthUserInfo[]>(`${environment.REST_API_URL}auth/users`);
  }

  createUser(payload: { username: string; password: string; profile: UserProfile }): Observable<AuthUserInfo> {
    return this.http.post<AuthUserInfo>(`${environment.REST_API_URL}auth/users`, payload);
  }

  deleteUser(username: string): Observable<void> {
    return this.http.delete<void>(`${environment.REST_API_URL}auth/users/${encodeURIComponent(username)}`);
  }
}
