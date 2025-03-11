import { Component } from '@angular/core';
import { TablaComparacionComponent } from '../components/tables/tabla-comparacion/tabla-comparacion.component';
import { TablaComponent } from '../components/tables/tabla/tabla.component';
import { ButtonMediasComponent } from '../components/buttons/button-medias/button-medias.component';
import { TablaResultadoMediaComponent } from '../components/tables/tabla-resultado-media/tabla-resultado-media.component';

@Component({
  selector: 'app-medias',
  standalone: true,
  imports: [
    TablaComponent,
    TablaResultadoMediaComponent,
    ButtonMediasComponent,
  ],
  templateUrl: './medias.component.html',
  styleUrl: './medias.component.css',
})
export class MediasComponent {}
