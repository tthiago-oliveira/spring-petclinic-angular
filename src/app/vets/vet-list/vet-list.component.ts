import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Vet } from '../vet';
import { VetService } from '../vet.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-vet-list',
  standalone: false,
  templateUrl: './vet-list.component.html',
  styleUrls: ['./vet-list.component.css']
})
export class VetListComponent implements OnInit {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  vets: Vet[] = [];
  errorMessage = '';
  successMessage = '';
  responseStatus = 0;
  isVetDataReceived = false;
  vetPendingDeletion: Vet | null = null;

  constructor(
    private vetService: VetService,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.vetService
      .getVets()
      .pipe(
        finalize(() => {
          this.isVetDataReceived = true;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: (vets) => (this.vets = vets),
        error: (error) =>
          (this.errorMessage = typeof error === 'string' ? error : 'Erro ao carregar veterinários.')
      });
  }

  openDeleteModal(vet: Vet): void {
    this.errorMessage = '';
    this.vetPendingDeletion = vet;
  }

  cancelDelete(): void {
    this.vetPendingDeletion = null;
  }

  confirmDeleteVet(): void {
    if (!this.vetPendingDeletion) {
      return;
    }
    const target = this.vetPendingDeletion;
    this.vetService
      .deleteVet(target.id.toString())
      .pipe(finalize(() => this.changeDetectorRef.markForCheck()))
      .subscribe({
        next: (response) => {
          this.responseStatus = response;
          this.vets = this.vets.filter((currentItem) => currentItem.id !== target.id);
          this.vetPendingDeletion = null;
          this.successMessage = `Veterinário(a) ${target.firstName} ${target.lastName} removido(a) com sucesso.`;
        },
        error: (error) => {
          this.vetPendingDeletion = null;
          this.errorMessage = typeof error === 'string' ? error : 'Não foi possível excluir o veterinário.';
        }
      });
  }

  gotoHome(): void {
    this.router.navigate(['/welcome']);
  }

  addVet(): void {
    this.router.navigate(['/vets/add']);
  }

  editVet(vet: Vet): void {
    this.router.navigate(['/vets', vet.id, 'edit']);
  }
}
