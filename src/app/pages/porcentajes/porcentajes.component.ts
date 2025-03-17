import { Component } from '@angular/core';
import { TablaComponent } from '../../components/tables/tabla/tabla.component';
import { TablaComparacionComponent } from '../../components/tables/tabla-comparacion/tabla-comparacion.component';
import { ButtonComponentPorcentajeMedias } from '../../components/buttons/button-porcentajes/button-porcentajes-medias.component';

@Component({
  selector: 'app-porcentajes',
  standalone: true,
  imports: [
    TablaComponent,
    TablaComparacionComponent,
    ButtonComponentPorcentajeMedias,
  ],
  templateUrl: './porcentajes.component.html',
  styleUrl: './porcentajes.component.css',
})
export class PorcentajesComponent {}
