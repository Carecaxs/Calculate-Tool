import { Component } from '@angular/core';
import { TablaComponent } from '../components/tables/tabla/tabla.component';
import { TablaComparacionComponent } from '../components/tables/tabla-comparacion/tabla-comparacion.component';

@Component({
  selector: 'app-porcentajes',
  standalone: true,
  imports: [TablaComponent, TablaComparacionComponent],
  templateUrl: './porcentajes.component.html',
  styleUrl: './porcentajes.component.css',
})
export class PorcentajesComponent {}
