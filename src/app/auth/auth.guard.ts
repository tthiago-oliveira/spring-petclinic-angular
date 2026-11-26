import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService, UserProfile } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/login']);
    }

    const allowedProfiles = route.data['profiles'] as UserProfile[] | undefined;
    if (allowedProfiles && !allowedProfiles.includes(this.authService.getProfile())) {
      return this.router.createUrlTree(['/welcome']);
    }

    return true;
  }
}
