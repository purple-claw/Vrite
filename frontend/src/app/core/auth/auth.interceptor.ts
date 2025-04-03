import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private authRoutes = ['/auth/login', '/auth/register'];

  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding token for auth routes
    if (this.authRoutes.some(route => req.url.includes(route))) {
      return next.handle(req);
    }

    const token = this.auth.getToken();
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    return next.handle(req).pipe(
      catchError((err) => {
        if (err.status === 401) {
          this.auth.clearAuthData();
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url }
          });
        }
        return throwError(() => err);
      })
    );
  }
}