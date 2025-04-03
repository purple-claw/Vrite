import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  constructor(private router: Router) {}
  
  home(){
    this.router.navigate(['/'])
  }

  profile(){
    this.router.navigate(['/profile'])
  }

  logout(){
    this.router.navigate(['/logout'])
  }

}