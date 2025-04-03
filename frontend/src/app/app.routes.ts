import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./landing-page/landing-page.component').then(m => m.LandingPageComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'tasks',
        loadComponent: () => import('./task-list/task-list.component').then(m => m.TaskListComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];