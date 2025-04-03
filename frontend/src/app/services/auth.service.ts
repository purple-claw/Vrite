import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:5300/api/auth';
  private readonly BASE_URL = 'http://localhost:5300/api/';
  private readonly PROFILE_URL = `${this.API_URL}/profile`;
  private readonly tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  register(email: string, password: string, fullName: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.API_URL}/register`,
      { email, password, fullName },
      { headers: this.getDefaultHeaders() }
    ).pipe(
      tap(response => {
        this.setToken(response.token);
        this.loadUserProfile();
      }),
      catchError(error => {
        console.error('Registration error:', error);
        throw this.handleError(error);
      })
    );
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.API_URL}/login`,
      { email, password },
      { headers: this.getDefaultHeaders() }
    ).pipe(
      tap(response => {
        this.setToken(response.token);
        this.loadUserProfile();
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw this.handleError(error);
      })
    );
  }

  loadUserProfile(): void {
    try {
      const token = this.getToken();
      if (!token) {
        this.clearAuthData();
        return;
      }

      this.http.get<User>(this.PROFILE_URL, {
        headers: this.getAuthHeaders()
      }).subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.setUserData(user);
        },
        error: (err) => {
          console.error('Profile load error:', err);
          if (err.status === 401) {
            this.clearAuthData();
            this.router.navigate(['/login']);
          }
        }
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  updateProfile(profileData: { fullName: string }): Observable<User> {
    return this.http.put<User>(this.PROFILE_URL, profileData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(error => {
        console.error('Profile update error:', error);
        throw this.handleError(error);
      })
    );
  }

  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.tokenKey);
      if (token && this.isTokenExpired(token)) {
        this.clearAuthData();
        return null;
      }
      return token;
    }
    return null;
  }

  clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('user_data');
    }
    this.currentUserSubject.next(null);
  }

  getCurrentUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = this.jwtDecode(token);
      return decoded?.sub || decoded?.userId || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private setUserData(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  }

  private getDefaultHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      this.clearAuthData();
      throw new Error('Authorization token is missing');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = this.jwtDecode(token);
      return decoded?.exp ? Date.now() >= decoded.exp * 1000 : true;
    } catch {
      return true;
    }
  }

  private jwtDecode(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  private handleError(error: any): Error {
    if (error.status === 401) {
      this.clearAuthData();
      this.router.navigate(['/login']);
    }
    return error;
  }
}

export interface User {
  id: number;
  email: string;
  fullName?: string;
  role: string;
}