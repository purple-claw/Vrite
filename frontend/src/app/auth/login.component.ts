import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="login-container">
      <h2>Login</h2>
      <form (submit)="onLogin($event)">
        <input 
          type="email" 
          [(ngModel)]="email" 
          name="email"
          placeholder="Email" 
          required
        />
        <input 
          type="password" 
          [(ngModel)]="password" 
          name="password"
          placeholder="Password" 
          required
        />
        <button type="submit" [disabled]="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        <div class="auth-footer">
          Don't have an account? <a routerLink="/register">Create one</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .login-container h2 {
      text-align: center;
      margin-bottom: 20px;
    }
    .login-container input {
      display: block;
      width: 100%;
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .login-container button {
      width: 100%;
      padding: 10px;
      background-color: #4a90e2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .login-container button:hover {
      background-color: #357abd;
    }
    .login-container button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .error-message {
      color: #d32f2f;
      margin-top: 10px;
      text-align: center;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(event: Event) {
    event.preventDefault();
    this.isLoading = true;
    this.errorMessage = '';
  
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.authService.loadUserProfile();
          this.router.navigate(['/tasks']);
        }, 100);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 0) {
          this.errorMessage = 'Server unavailable. Check your connection.';
        } else if (err.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
        console.error('Login error:', err);
      }
    });
  } 
}