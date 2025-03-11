import { Component } from '@angular/core';
import { TablaComponent } from '../../tables/tabla/tabla.component';
import { ButtonMediasComponent } from '../../buttons/button-medias/button-medias.component';
import { TablaResultadoMediaComponent } from '../../tables/tabla-resultado-media/tabla-resultado-media.component';
import { ButtonNormasComponent } from '../../buttons/button-normas/button-normas.component';
import { TablaResultadoNormaComponent } from '../../tables/tabla-resultado-norma/tabla-resultado-norma.component';

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
