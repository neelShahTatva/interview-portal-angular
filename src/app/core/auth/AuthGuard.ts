import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { TokenClaims } from './interfaces/token-claims.interface';
import { AuthService } from './services/auth.service';

export function AuthGuard(role?: Number[]): CanActivateFn {
  return async (
    routeSnapshot: ActivatedRouteSnapshot,
    stateSnapshot: RouterStateSnapshot,
  ) => {
    const authService: AuthService = inject(AuthService);
    const router: Router = inject(Router);
    let routeUrl = stateSnapshot.url;

    try {
      if (!authService.isTokenExists()) {
        authService.taskAfterLogout();
        router.navigate(['/auth/login']);
        return false;
      }
      const claims: TokenClaims = authService.getClaims();

      //   if (!claims.IsAdmin && !authService.hasAccessToPage(routeUrl)) {
      //     router.navigate(["/access-denied"]);
      //     return false;
      //   }

      return true;
    } catch (error) {
      authService.logout();
      router.navigate(['/auth/login']);
      return false;
    }
  };
}
