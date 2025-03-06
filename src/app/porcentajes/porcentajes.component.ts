import { Component } from '@angular/core';
import { TablaComponent } from '../components/tables/tabla/tabla.component';
import { TablaComparacionComponent } from '../components/tables/tabla-comparacion/tabla-comparacion.component';
import { ButtonComponent } from '../components/buttons/button-porcentajes/button-porcentajes.component';

@Component({
  selector: 'app-porcentajes',
  standalone: true,
  imports: [TablaComponent, TablaComparacionComponent, ButtonComponent],
  templateUrl: './porcentajes.component.html',
  styleUrl: './porcentajes.component.css',
})
export class PorcentajesComponent {}
