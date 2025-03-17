import { Component } from '@angular/core';
import { TablaComponent } from '../../components/tables/tabla/tabla.component';
import { TablaResultadoMediaComponent } from '../../components/tables/tabla-resultado-media/tabla-resultado-media.component';
import { ButtonComponentPorcentajeMedias } from '../../components/buttons/button-porcentajes/button-porcentajes-medias.component';

@Component({
  selector: 'app-medias',
  standalone: true,
  imports: [
    TablaComponent,
    TablaResultadoMediaComponent,
    ButtonComponentPorcentajeMedias,
  ],
  templateUrl: './medias.component.html',
  styleUrl: './medias.component.css',
})
export class MediasComponent {}
