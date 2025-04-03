import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <h2>User Profile</h2>
      
      <div *ngIf="user" class="profile-info">
        <div class="profile-field">
          <label>Email:</label>
          <span>{{ user.email }}</span>
        </div>
        
        <div class="profile-field">
          <label>Full Name:</label>
          <input 
            type="text" 
            [(ngModel)]="user.fullName" 
            name="fullName"
            *ngIf="isEditing; else viewFullName"
          >
          <ng-template #viewFullName>
            <span>{{ user.fullName || 'Not set' }}</span>
          </ng-template>
        </div>
        
        <div class="profile-field">
          <label>Role:</label>
          <span>{{ user.role }}</span>
        </div>
        
        <div class="profile-actions">
          <button 
            *ngIf="!isEditing; else saveCancelGroup" 
            (click)="startEditing()"
          >
            Edit Profile
          </button>
          
          <ng-template #saveCancelGroup>
            <button (click)="saveProfile()" [disabled]="isSaving">
              {{ isSaving ? 'Saving...' : 'Save' }}
            </button>
            <button (click)="cancelEditing()">Cancel</button>
          </ng-template>
          
          <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
        
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 600px;
      margin: 30px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .profile-info {
      margin-top: 20px;
    }
    
    .profile-field {
      margin-bottom: 15px;
      display: flex;
      align-items: center;
    }
    
    .profile-field label {
      width: 120px;
      font-weight: bold;
    }
    
    .profile-field input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .profile-actions {
      margin-top: 25px;
      display: flex;
      gap: 10px;
    }
    
    button {
      padding: 8px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    button:not(.logout-btn) {
      background-color: #4a90e2;
      color: white;
    }
    
    button:hover:not(.logout-btn) {
      background-color: #357abd;
    }
    
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    .logout-btn {
      background-color: #f44336;
      color: white;
      margin-left: auto;
    }
    
    .logout-btn:hover {
      background-color: #d32f2f;
    }
    
    .error-message {
      color: #d32f2f;
      margin-top: 15px;
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: any;
  isEditing = false;
  isSaving = false;
  errorMessage = '';
  originalUserData: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.user = { ...user };
        this.originalUserData = { ...user };
      },
      error: (err) => {
        this.errorMessage = 'Failed to load profile';
        console.error(err);
      }
    });
  }

  startEditing() {
    this.isEditing = true;
  }

  saveProfile() {
    this.isSaving = true;
    this.errorMessage = '';
    
    this.authService.updateProfile({
      fullName: this.user.fullName
    }).subscribe({
      next: () => {
        this.isEditing = false;
        this.isSaving = false;
        this.originalUserData = { ...this.user };
      },
      error: (err) => {
        this.errorMessage = err.error || 'Failed to update profile';
        this.isSaving = false;
      }
    });
  }

  cancelEditing() {
    this.isEditing = false;
    this.user = { ...this.originalUserData };
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}