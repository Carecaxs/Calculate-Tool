import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 🔹 Importar FormsModule
import { CommonModule } from '@angular/common';

import { TablaServiceService } from '../../services/tabla-service.service'; // 🔹 Importar FormsModule
import { TablaPorcetajesService } from '../../services/tabla-porcetajes.service';

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
    colorSeleccionado: '',
  }));
  currentColumns: any[] = [];

  constructor(
    private tablaService: TablaServiceService,
    private tablaPorcentajeService: TablaPorcetajesService
  ) {} // Inyectamos el servicio en el constructor

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

  //metodo para actualizar la cantidad de filas, recibe el nuevo numero de filas, tiene que ser mayor a 1
  actualizarFilas(numeroDeFilas: number) {
    if (numeroDeFilas > 1) {
      this.tablaService.updateRowCount(numeroDeFilas);
    }
  }

  //metodo para actualizar la cantidad de columnas, recibe el nuevo numero de columnas, tiene que ser mayor a 1
  actualizarColumnas(numeroDeColumnas: number) {
    if (numeroDeColumnas >= 2) {
      this.tablaService.updateColumnCount(numeroDeColumnas + 1);
      this.cargarColumnasActuales();
    }
  }

  modificarComparaciones() {}

  // Función para manejar el cambio de cantidad de comparaciones
  onComparacionesChange() {
    //modificar size del arreglo comparaciones
    this.comparaciones = Array.from(
      { length: this.numeroDeComparaciones },
      () => ({
        firstColumnSelected: '',
        secondColumnSelected: '',
        colorSeleccionado: '#000000',
      })
    );
  }

  //funcion para manejar cambio de diferencia significativa
  onDiferenciaChange() {
    this.tablaPorcentajeService.setDiferenciaSifnificativa(
      this.diferenciaSeleccionada
    );
  }

  //funcion que limpia los datos de la tabla
  limpiarDatos() {
    this.tablaService.limpiarDatosTabla();
  }

  onComparacionesDifSig() {
    //aplicar los colores seleccionado a las columnas de las tablas
    this.tablaService.applyColorsToColumns();
  }

  //ejecuta el calculo con las comparaciones contenidas
  ejecutarCalculo() {
    // Filtrar solo las comparaciones completas (cuando ambas columnas están seleccionadas)
    const comparacionesValidas = this.comparaciones
      .filter((c) => c.firstColumnSelected && c.secondColumnSelected)
      .map((c) => ({
        col1: c.firstColumnSelected,
        col2: c.secondColumnSelected,
        color: c.colorSeleccionado,
      }));
    console.log(comparacionesValidas);

    //se envia los datos de la tabla original y los elementos de comparacion
    //se instancia la tabla original, se  recuperan los datos y se envien como parametro
    const data = this.tablaService.getTableInstance();
    this.tablaPorcentajeService.setComparaciones(
      data.getData(),
      comparacionesValidas
    );

    //aplicar los colores seleccionado a las columnas de las tablas
    this.tablaService.applyColorsToColumns();
  }
}
