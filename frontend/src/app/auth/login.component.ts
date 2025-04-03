import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  host: {
    'ngSkipHydration': '' 
  }
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