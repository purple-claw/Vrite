import { Routes } from '@angular/router';
// import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full'
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
        redirectTo: 'tasks'
    }
];