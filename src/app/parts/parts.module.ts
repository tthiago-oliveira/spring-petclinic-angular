import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { WelcomeComponent } from './welcome/welcome.component';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule],
  declarations: [PageNotFoundComponent, WelcomeComponent],
  exports: [PageNotFoundComponent, WelcomeComponent]
})
export class PartsModule {}
