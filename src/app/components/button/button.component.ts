import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 🔹 Importar FormsModule
import { CommonModule } from '@angular/common';

import { TablaServiceService } from '../../services/tabla-service.service'; // 🔹 Importar FormsModule

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [FormsModule, CommonModule], //necesario para usar la sincronizacion entre inputs y variables del componente
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  numeroDeFilas: number = 10; //esta variable se sincroniza con el input de cantidad de filas
  numeroDeColumnas: number = 2; // esta variable se sincroniza con el input de cantidad de columnas
  diferenciaSeleccionada: number = 95; // esta variable se sincroniza con el input de diferencia significativa

  numeroDeComparaciones: number = 1; // esta variable se sincroniza con el input de cantidad de comparaciones

  //este arreglo se enlaza con los select del html, se crea un arreglo del tamano de la cantidad de comparaciones y cada index va tener dos variables para guardar
  // las comparaciones
  comparaciones = Array.from({ length: this.numeroDeComparaciones }, () => ({
    firstColumnSelected: '',
    secondColumnSelected: '',
  }));
  currentColumns: any[] = [];

  constructor(private tablaService: TablaServiceService) {} // Inyectamos el servicio en el constructor

  ngAfterViewInit() {
    this.tablaService.tablaLista$.subscribe((estado) => {
      if (estado) {
        this.cargarColumnasActuales();
      }
    });
  }

  cargarColumnasActuales() {
    //alamacenar las columnas de la tabla, usamos slice para saltarnos la primera columna que va ser "letras"
    this.currentColumns = this.tablaService
      .getColumnsData()
      .slice(1)
      .map((column) => ({
        field: column.getField(),
        title: column.getDefinition().title,
      }));
  }

  actualizarFilas(numeroDeFilas: number) {
    this.tablaService.updateRowCount(numeroDeFilas);
  }

  actualizarColumnas(numeroDeColumnas: number) {
    this.tablaService.updateColumnCount(numeroDeColumnas + 1);
  }

  modificarComparaciones() {}

  limpiarDatos() {}

  // Función para manejar el cambio de cantidad de comparaciones
  onComparacionesChange() {
    //modificar size del arreglo comparaciones
    this.comparaciones = Array.from(
      { length: this.numeroDeComparaciones },
      () => ({
        firstColumnSelected: '',
        secondColumnSelected: '',
      })
    );
  }

  //funcion para manejar cambio de diferencia significativa
  onDiferenciaChange() {
    console.log(this.diferenciaSeleccionada);
  }
}
