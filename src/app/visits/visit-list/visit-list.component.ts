import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Visit } from '../visit';
import { VisitService } from '../visit.service';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-visit-list',
  standalone: false,
  templateUrl: './visit-list.component.html',
  styleUrls: ['./visit-list.component.css']
})
export class VisitListComponent implements OnInit {
  private readonly COMPLETED_PREFIX = '[CONCLUÍDA] ';

  @Input() visits: Visit[] = [];
  @Input() petId?: number;

  responseStatus = 0;
  noVisits = false;
  errorMessage = '';
  successMessage = '';
  visitPendingDeletion: Visit | null = null;
  completingVisitId: number | null = null;

  constructor(
    private router: Router,
    private visitService: VisitService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    public authService: AuthService
  ) {}

  ngOnInit(): void {}

  isCompleted(visit: Visit): boolean {
    return (visit.description || '').startsWith(this.COMPLETED_PREFIX);
  }

  cleanDescription(visit: Visit): string {
    const desc = visit.description || '';
    return this.isCompleted(visit) ? desc.substring(this.COMPLETED_PREFIX.length) : desc;
  }

  editVisit(visit: Visit): void {
    this.router.navigate(['/visits', visit.id, 'edit']);
  }

  markAsCompleted(visit: Visit): void {
    if (this.isCompleted(visit) || !visit.id) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.completingVisitId = visit.id;

    const updatedDescription = `${this.COMPLETED_PREFIX}${visit.description || 'Atendimento realizado'}`;
    const payload = {
      id: visit.id,
      date: visit.date,
      description: updatedDescription,
      petId: this.petId || visit.pet?.id
    };

    this.http.put(`${environment.REST_API_URL}visits/${visit.id}`, payload).subscribe({
      next: () => {
        visit.description = updatedDescription;
        this.completingVisitId = null;
        this.successMessage = 'Consulta marcada como concluída!';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.completingVisitId = null;
        this.errorMessage = err?.error?.detail || 'Não foi possível concluir a consulta.';
        this.cdr.markForCheck();
      }
    });
  }

  openDeleteModal(visit: Visit): void {
    this.errorMessage = '';
    this.visitPendingDeletion = visit;
  }

  cancelDelete(): void {
    this.visitPendingDeletion = null;
  }

  confirmDeleteVisit(): void {
    if (!this.visitPendingDeletion) {
      return;
    }
    const target = this.visitPendingDeletion;
    this.visitService.deleteVisit(target.id.toString()).subscribe({
      next: (response) => {
        this.responseStatus = response;
        this.visits.splice(this.visits.indexOf(target), 1);
        if (this.visits.length === 0) {
          this.noVisits = true;
        }
        this.visitPendingDeletion = null;
        this.successMessage = 'Consulta removida com sucesso.';
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.visitPendingDeletion = null;
        this.errorMessage = typeof error === 'string' ? error : 'Não foi possível excluir a consulta.';
        this.cdr.markForCheck();
      }
    });
  }
}
