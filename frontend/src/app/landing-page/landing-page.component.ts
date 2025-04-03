import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
    constructor(private router: Router) {}

    profile() {
        this.router.navigate(['/profile']);
    }

    tasks() {
        this.router.navigate(['/tasks']);
    }

    login()
    {
        this.router.navigate(['/login']);
    }

    register() {
        this.router.navigate(['/register']);
    }
}