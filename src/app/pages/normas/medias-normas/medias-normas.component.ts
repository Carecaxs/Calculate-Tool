import { Component } from '@angular/core';
import { TablaComponent } from '../../../components/tables/tabla/tabla.component';
import { ButtonNormasComponent } from '../../../components/buttons/button-normas/button-normas.component';
import { TablaResultadoNormaComponent } from '../../../components/tables/tabla-resultado-norma/tabla-resultado-norma.component';

@Component({
  selector: 'app-medias-normas',
  standalone: true,
  imports: [
    TablaComponent,
    ButtonNormasComponent,
    TablaResultadoNormaComponent,
  ],
  templateUrl: './medias-normas.component.html',
  styleUrl: './medias-normas.component.css',
})
export class MediasNormasComponent {}
