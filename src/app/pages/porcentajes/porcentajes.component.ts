import { Component } from '@angular/core';
import { TablaComponent } from '../../components/tables/tabla/tabla.component';
import { TablaResultadoPorcentajeMediasComponent } from '../../components/tables/tabla-resultado-porcentajes-medias/tabla-resultado-porcetajes-medias.component';
import { ButtonComponentPorcentajeMedias } from '../../components/buttons/button-porcentajes-medias/button-porcentajes-medias.component';

@Component({
  selector: 'app-porcentajes',
  standalone: true,
  imports: [
    TablaComponent,
    ButtonComponentPorcentajeMedias,
    TablaResultadoPorcentajeMediasComponent,
  ],
  templateUrl: './porcentajes.component.html',
  styleUrl: './porcentajes.component.css',
})
export class PorcentajesComponent {}
