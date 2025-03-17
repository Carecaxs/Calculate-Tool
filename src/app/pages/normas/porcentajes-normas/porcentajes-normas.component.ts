import { Component } from '@angular/core';
import { ButtonNormasComponent } from '../../../components/buttons/button-normas/button-normas.component';
import { TablaComponent } from '../../../components/tables/tabla/tabla.component';
import { TablaResultadoNormaComponent } from '../../../components/tables/tabla-resultado-norma/tabla-resultado-norma.component';

@Component({
  selector: 'app-porcentajes-normas',
  standalone: true,
  imports: [
    ButtonNormasComponent,
    TablaComponent,
    TablaResultadoNormaComponent,
  ],
  templateUrl: './porcentajes-normas.component.html',
  styleUrl: './porcentajes-normas.component.css',
})
export class PorcentajesNormasComponent {}
