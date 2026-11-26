import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './parts/page-not-found/page-not-found.component';
import { WelcomeComponent } from './parts/welcome/welcome.component';
import { LoginComponent } from './auth/login/login.component';
import { StaffManagementComponent } from './admin/staff-management/staff-management.component';
import { AuthGuard } from './auth/auth.guard';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'welcome', component: WelcomeComponent, canActivate: [AuthGuard] },
  {
    path: 'staff',
    component: StaffManagementComponent,
    canActivate: [AuthGuard],
    data: { profiles: ['ADMIN'] }
  },
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
