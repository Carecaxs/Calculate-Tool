import { Routes } from '@angular/router';
import { PorcentajesComponent } from './porcentajes/porcentajes.component';
import { MediasComponent } from './medias/medias.component';
import { MediasNormasComponent } from './components/normas/medias-normas/medias-normas.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'porcentajes', // Redirige a la vista de porcentajes
    pathMatch: 'full',
  },
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
  {
    path: 'medias-normas',
    component: MediasNormasComponent,
    data: { mode: 'medias-normas' },
  },
  {
    path: 'porcentajes-normas',
    component: MediasNormasComponent,
    data: { mode: 'porcentajes-normas' },
  },
];
