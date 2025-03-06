import { Routes } from '@angular/router';
import { PorcentajesComponent } from './porcentajes/porcentajes.component';
import { MediasComponent } from './medias/medias.component';

export const routes: Routes = [
  {
    path: 'porcentajes',
    component: PorcentajesComponent,
    data: { mode: 'porcentajes' },
  },
  {
    path: 'medias',
    component: MediasComponent,
    data: { mode: 'medias' },
  },
];
