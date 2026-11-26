import { Component, OnInit } from '@angular/core';
import { AuthService, AuthUserInfo, UserProfile } from '../../auth/auth.service';

@Component({
  selector: 'app-staff-management',
  templateUrl: './staff-management.component.html',
  standalone: false
})
export class StaffManagementComponent implements OnInit {
  users: AuthUserInfo[] = [];
  newUsername = '';
  newPassword = '';
  newProfile: UserProfile = 'RECEPCIONISTA';

  loading = false;
  feedbackSuccess = '';
  feedbackError = '';

  userPendingDeletion: AuthUserInfo | null = null;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.listUsers().subscribe({
      next: (list) => (this.users = list),
      error: () => (this.feedbackError = 'Não foi possível carregar a lista de colaboradores.')
    });
  }

  createMember(): void {
    this.feedbackSuccess = '';
    this.feedbackError = '';
    this.loading = true;

    this.authService
      .createUser({
        username: this.newUsername,
        password: this.newPassword,
        profile: this.newProfile
      })
      .subscribe({
        next: (created) => {
          this.loading = false;
          this.feedbackSuccess = `Colaborador "${created.username}" (${this.authService.getProfileLabel(
            created.profile
          )}) cadastrado com sucesso!`;
          this.newUsername = '';
          this.newPassword = '';
          this.newProfile = 'RECEPCIONISTA';
          this.loadUsers();
        },
        error: (err) => {
          this.loading = false;
          this.feedbackError = err?.error?.detail || 'Erro ao cadastrar colaborador.';
        }
      });
  }

  openDeleteModal(user: AuthUserInfo): void {
    this.userPendingDeletion = user;
  }

  cancelDelete(): void {
    this.userPendingDeletion = null;
  }

  confirmDelete(): void {
    if (!this.userPendingDeletion) {
      return;
    }
    const target = this.userPendingDeletion.username;
    this.feedbackSuccess = '';
    this.feedbackError = '';

    this.authService.deleteUser(target).subscribe({
      next: () => {
        this.userPendingDeletion = null;
        this.feedbackSuccess = `Acesso de "${target}" removido com sucesso.`;
        this.loadUsers();
      },
      error: (err) => {
        this.userPendingDeletion = null;
        this.feedbackError = err?.error?.detail || 'Não foi possível remover este usuário.';
      }
    });
  }
}
