import { Component } from '@angular/core';
import { ButtonComponent } from '../../buttons/button-porcentajes/button-porcentajes.component';

@Component({
  selector: 'app-comparison-controls',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './comparison-controls.component.html',
  styleUrl: './comparison-controls.component.css',
})
export class ComparisonControlsComponent {}
