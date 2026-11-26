import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PetService } from '../pet.service';
import { Pet } from '../pet';

@Component({
  selector: 'app-pet-list',
  standalone: false,
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.css']
})
export class PetListComponent implements OnInit {
  errorMessage = '';
  @Input() pet: Pet;
  responseStatus = 0;
  deleteSuccess = false;
  showDeleteModal = false;

  constructor(private router: Router, private petService: PetService) {
    this.pet = {} as Pet;
  }

  ngOnInit(): void {}

  editPet(pet: Pet): void {
    this.router.navigate(['/pets', pet.id, 'edit']);
  }

  openDeleteModal(): void {
    this.errorMessage = '';
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  confirmDeletePet(): void {
    if (!this.pet || !this.pet.id) {
      return;
    }
    this.petService.deletePet(this.pet.id.toString()).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.deleteSuccess = true;
        this.pet = {} as Pet;
      },
      error: (error) => {
        this.showDeleteModal = false;
        this.errorMessage = typeof error === 'string' ? error : 'Não foi possível excluir o pet.';
      }
    });
  }

  addVisit(pet: Pet): void {
    this.router.navigate(['/pets', pet.id, 'visits', 'add']);
  }
}
