import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

    redirectedUrls;

    constructor(
        private authServices : AuthService,
        private router : Router
    ) { }
    canActivate(
        router : ActivatedRouteSnapshot,
        state : RouterStateSnapshot
    ) {
        if (this.authServices.loggedIn()) {
            return true;
        }else{
            this.redirectedUrls = state.url;
            this.router.navigate(['/login']);
            return false;
        }
    }
}