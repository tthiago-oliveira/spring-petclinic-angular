import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  standalone: false
})
export class WelcomeComponent implements OnInit {
  ownersCount = 0;
  petsCount = 0;
  vetsCount = 0;
  pendingVisits = 0;
  completedVisits = 0;

  constructor(public authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.REST_API_URL}owners`).subscribe({
      next: (owners) => {
        this.ownersCount = owners.length;
        let pets = 0;
        let pending = 0;
        let done = 0;
        for (const owner of owners) {
          const ownerPets = owner.pets || [];
          pets += ownerPets.length;
          for (const pet of ownerPets) {
            for (const visit of pet.visits || []) {
              if ((visit.description || '').startsWith('[CONCLUÍDA]')) {
                done++;
              } else {
                pending++;
              }
            }
          }
        }
        this.petsCount = pets;
        this.pendingVisits = pending;
        this.completedVisits = done;
      }
    });

    this.http.get<any[]>(`${environment.REST_API_URL}vets`).subscribe({
      next: (vets) => (this.vetsCount = vets.length)
    });
  }
}
