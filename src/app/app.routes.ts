import { Routes } from '@angular/router';
import { PorcentajesComponent } from './porcentajes/porcentajes.component';
import { MediasComponent } from './medias/medias.component';

export const routes: Routes = [
  {
    path: 'porcentajes',
    component: PorcentajesComponent,
  },
  {
    path: 'medias',
    component: MediasComponent,
  },
];
