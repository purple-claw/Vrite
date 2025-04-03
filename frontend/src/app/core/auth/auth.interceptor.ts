import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent
  } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';
  import { Router } from '@angular/router';
  import { AuthService } from '../../services/auth.service';
  import { throwError } from 'rxjs';
  import { catchError } from 'rxjs';
  
  @Injectable()
  export class JwtInterceptor implements HttpInterceptor {
    constructor(private auth: AuthService, private router: Router) {}  
    intercept(
      req: HttpRequest<any>,
      next: HttpHandler
    ): Observable<HttpEvent<any>> {
      const token = this.auth.getToken();
      
      // Skip adding token for login/register requests
      if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
        return next.handle(req);
      }
    
      if (token) {
        req = req.clone({
          setHeaders: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    
      return next.handle(req).pipe(
        catchError((err) => {
          if (err.status === 401) {
            this.auth.clearAuthData();
            this.router.navigate(['/login']);
          }
          return throwError(() => err);
        })
      );
    }
  }