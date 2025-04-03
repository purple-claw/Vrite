import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as AOS from 'aos';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  constructor(private router: Router) {}

  
  register(): void {
    this.router.navigate(['/register']);
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  tasks(): void {
    this.router.navigate(['/tasks']);
  }

  profile(): void {
    this.router.navigate(['/profile']);
  }
}