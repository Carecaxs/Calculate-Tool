import { Component } from '@angular/core';
import { TablaComponent } from '../../components/tables/tabla/tabla.component';

import { ButtonComponentPorcentajeMedias } from '../../components/buttons/button-porcentajes-medias/button-porcentajes-medias.component';
import { TablaResultadoPorcentajeMediasComponent } from '../../components/tables/tabla-resultado-porcentajes-medias/tabla-resultado-porcetajes-medias.component';

@Component({
  selector: 'app-medias',
  standalone: true,
  imports: [
    TablaComponent,
    ButtonComponentPorcentajeMedias,
    TablaResultadoPorcentajeMediasComponent,
  ],
  templateUrl: './medias.component.html',
  styleUrl: './medias.component.css',
})
export class MediasComponent {}
