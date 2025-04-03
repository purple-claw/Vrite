import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  host: {
    'ngSkipHydration': '' 
  }
})
export class RegisterComponent {
  email = '';
  password = '';
  fullName = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister(event: Event) {
    event.preventDefault();
    
    // Validate form
    if (!this.email || !this.password || !this.fullName) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }
  
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = '';
  
    this.authService.register(this.email, this.password, this.fullName).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.isLoading = false;
        
        if (err.status === 0) {
          // Network or CORS error (server not reachable)
          this.errorMessage = 'Unable to connect to server. Please check your connection.';
        } else if (err.status === 400) {
          // Bad request (validation errors from server)
          this.errorMessage = err.error?.errors?.join(', ') || 'Invalid registration data';
        } else if (err.status === 409) {
          // Conflict (user already exists)
          this.errorMessage = err.error?.message || 'Email already registered';
        } else {
          // Other server errors
          this.errorMessage = err.error?.message || 'Registration Successful. Please Login.';
        }
        
        console.error('Registration error details:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}