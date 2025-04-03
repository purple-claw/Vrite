import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Task } from '../task-list/task-list.component';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:5300/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      this.handleMissingToken();
      throw new Error('Please login to continue');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  private handleMissingToken(): void {
    this.authService.clearAuthData();
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }

  private handleError(error: any): Observable<never> {
    if (error.status === 401) {
      this.handleMissingToken();
    }
    return throwError(() => error);
  }

  clearToken() {
    localStorage.removeItem('authToken'); 
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/task`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/task`, task, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/task/${id}`, task, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/task/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateTaskStatus(id: number, status: string): Observable<void> {
    // Ensure this matches your backend route exactly
    return this.http.patch<void>(
      `${this.baseUrl}/task/${id}/status`, 
      `"${status}"`,  // Note the quotes for string values
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    );
  }
}