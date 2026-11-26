import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let authReq = req;
    const authHeader = this.authService.getAuthHeader();

    if (req.url.startsWith(environment.REST_API_URL) && authHeader && !req.headers.has('Authorization')) {
      authReq = req.clone({
        setHeaders: {
          Authorization: authHeader
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.endsWith('auth/me')) {
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
