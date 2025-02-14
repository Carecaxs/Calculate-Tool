import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TablaComponent } from './components/tables/tabla/tabla.component';
import { TablaComparacionComponent } from './components/tables/tabla-comparacion/tabla-comparacion.component';
import { ComparisonControlsComponent } from "./components/controls/comparison-controls/comparison-controls.component";
import { routes } from './app.routes';  // Importa las rutas
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TablaComponent, TablaComparacionComponent, ComparisonControlsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Proyecto';
}
