import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:5300/api/auth';
  private readonly PROFILE_URL = `${this.API_URL}/profile`;
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Register a new user
   * @param email User's email
   * @param password User's password
   * @param fullName User's full name
   * @returns Observable with the authentication token
   */
  register(email: string, password: string, fullName: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.API_URL}/register`,
      { email, password, fullName },
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      tap(response => {
        this.setToken(response.token);
        this.loadUserProfile();
      }),
      catchError(error => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  /**
   * Login an existing user
   * @param email User's email
   * @param password User's password
   * @returns Observable with the authentication token
   */
  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.API_URL}/login`,
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      tap(response => {
        this.setToken(response.token);
        this.loadUserProfile();
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  /**
   * Load the current user's profile
   */
  loadUserProfile(): void {
    const token = this.getToken();
    if (!token) {
      this.clearAuthData();
      return;
    }
  
    this.http.get<User>(`${this.API_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
        // Store user data in local storage if needed
        localStorage.setItem('user_data', JSON.stringify(user));
      },
      error: (err) => {
        console.error('Profile load error:', err);
        if (err.status === 401) {
          // Token expired or invalid
          this.clearAuthData();
          this.router.navigate(['/login']);
        }
      }
    });
  }
  /**
   * Logout the current user
   */
  logout(): void {
    this.http.post(`${this.API_URL}/logout`, {}).subscribe({
      complete: () => {
        this.clearAuthData();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        this.clearAuthData();
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Update the current user's profile
   * @param profileData Object containing the updated profile data
   * @returns Observable with the updated user
   */
  updateProfile(profileData: { fullName: string }): Observable<User> {
    return this.http.put<User>(this.PROFILE_URL, profileData, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    }).pipe(
      catchError(error => {
        console.error('Profile update error:', error);
        throw error;
      })
    );
  }

  /**
   * Save the authentication token in local storage
   * @param token The authentication token
   */
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Retrieve the authentication token from local storage
   * @returns The authentication token or null if not found
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Clear authentication data (token and user)
   */
  public clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }
}

/**
 * User interface
 */
export interface User {
  id: number;
  email: string;
  fullName?: string;
  role: string;
}