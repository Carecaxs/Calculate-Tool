import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 🔹 Importar FormsModule
import { CommonModule } from '@angular/common';

import { TablaServiceService } from '../../services/tabla-service.service'; // 🔹 Importar FormsModule
import { TablaPorcetajesService } from '../../services/tabla-porcetajes.service';
declare var bootstrap: any;

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [FormsModule, CommonModule], //necesario para usar la sincronizacion entre inputs y variables del componente
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  numeroDeFilas: number = 10; //esta variable se sincroniza con el input de cantidad de filas
  columnaOptions: number[] = Array.from({ length: 29 }, (_, i) => i + 2); // propiedad que Genera las opciones de columna [2, 3, ..., 30]
  numeroDeColumnas: number = 2; // esta variable se sincroniza con el input de cantidad de columnas
  diferenciaSeleccionada: number = 95; // esta variable se sincroniza con el input de diferencia significativa

  comparacionesOptions: number[] = Array.from({ length: 8 }, (_, i) => i + 1); // propiedad que Genera las opciones de comparaciones [1, ... 8,]
  numeroDeComparaciones: number = 1; // esta variable se sincroniza con el input de cantidad de comparaciones

  //este arreglo se enlaza con los select del html, se crea un arreglo del tamano de la cantidad de comparaciones y cada index va tener dos variables para guardar
  // las comparaciones
  comparaciones = Array.from({ length: this.numeroDeComparaciones }, () => ({
    firstColumnSelected: '',
    secondColumnSelected: '',
    colorSeleccionado: '#9FA1F4',
  }));
  currentColumns: any[] = [];

  //almacena los colores predefinidos para las comparaciones
  coloresPredefinidos = [
    '#9FA1F4', // Primera comparación
    '#EFB2B2', // Segunda comparación
    '#B2D8F0', // Tercera comparación
    '#E3B2F0', // Cuarta comparación
    '#B2ECF0', // Quinta comparación
    '#EFF0B2', // Sexta comparación
    '#B2F0C5', // Séptima comparación
    '#FFE9D6', // Octava comparación
  ];

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

  //metodo para evitar que al seleccionar cantidad de filas el usuario ingrese un cero de primero, ya despues de lo permite por ejemplo que quiera poner 10,20,etc...
  evitarCeroInicial(event: KeyboardEvent) {
    if (
      (event.key === '0' &&
        (!this.numeroDeFilas || this.numeroDeFilas.toString().length === 0)) ||
      event.key === '-'
    ) {
      event.preventDefault(); // Bloquea la tecla "0" si es el primer carácter
    }
  }

  //metodo para actualizar la cantidad de filas, recibe el nuevo numero de filas, tiene que ser mayor a 1
  actualizarFilas(numeroDeFilas: number) {
    if (numeroDeFilas > 0) {
      this.tablaService.updateRowCount(numeroDeFilas);
    }
  }

  //metodo para actualizar la cantidad de columnas, recibe el nuevo numero de columnas, tiene que ser mayor a 1
  actualizarColumnas(numeroDeColumnas: number) {
    if (numeroDeColumnas >= 2) {
      this.tablaService.updateColumnCount(Number(numeroDeColumnas) + 1);
      this.cargarColumnasActuales();
    }
  }

  modificarComparaciones() {}

  // Función para manejar el cambio de cantidad de comparaciones
  onComparacionesChange() {
    // Crear un nuevo arreglo con el tamaño actualizado
    this.comparaciones = Array.from(
      { length: this.numeroDeComparaciones },
      (_, i) => ({
        firstColumnSelected: this.comparaciones[i]?.firstColumnSelected || '',
        secondColumnSelected: this.comparaciones[i]?.secondColumnSelected || '',
        colorSeleccionado: this.coloresPredefinidos[i],
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
    this.comparaciones = Array.from(
      { length: this.numeroDeComparaciones },
      (_, i) => ({
        firstColumnSelected: '',
        secondColumnSelected: '',
        colorSeleccionado: this.coloresPredefinidos[i],
      })
    );
  }

  onComparacionesDifSig() {
    // Filtrar solo las comparaciones completas (cuando ambas columnas están seleccionadas)
    const comparacionesValidas = this.filtrarComparacionesValidas();

    this.tablaPorcentajeService.setComparaciones(comparacionesValidas);
    this.tablaService.applyColorsToColumns(1);
  }

  //ejecuta el calculo con las comparaciones contenidas
  ejecutarCalculo() {
    // // Filtrar solo las comparaciones completas (cuando ambas columnas están seleccionadas)
    // const comparacionesValidas = this.filtrarComparacionesValidas();

    // this.tablaPorcentajeService.setComparaciones(comparacionesValidas);
    //se envia los datos de la tabla original y los elementos de comparacion
    //se instancia la tabla original, se  recuperan los datos y se envien como parametro
    const data = this.tablaService.getTableInstance();
    this.tablaPorcentajeService.ejecutarCalculo(data.getData());

    //aplicar los colores seleccionado a las columnas de las tablas
    this.tablaService.applyColorsToColumns(2);
  }

  // metodo que filtra solo las comparaciones completas (cuando ambas columnas están seleccionadas) y las retorna
  filtrarComparacionesValidas(): {
    col1: string;
    col2: string;
    color: string;
  }[] {
    return this.comparaciones
      .filter((c) => c.firstColumnSelected && c.secondColumnSelected)
      .map((c) => ({
        col1: c.firstColumnSelected,
        col2: c.secondColumnSelected,
        color: c.colorSeleccionado,
      }));
  }

  //esta funcion evaulua en las opciones de comparacion las columnas que aun no estan dentro del rango de las comparaciones ya seleccionadas
  isOptionDisabled(
    columnField: string,
    currentComparisonIndex: number
  ): boolean {
    // Obtener el índice de la columna en el arreglo currentColumns
    const currentOptionIndex = this.currentColumns.findIndex(
      (c) => c.field === columnField
    );
    if (currentOptionIndex === -1) {
      return false;
    }

    // Evitar que la columna se compare consigo misma
    const currentComparison = this.comparaciones[currentComparisonIndex];
    if (
      currentComparison &&
      (currentComparison.firstColumnSelected === columnField ||
        currentComparison.secondColumnSelected === columnField)
    ) {
      return true; // Si la columna ya está seleccionada en este bloque, se deshabilita
    }

    // Recorrer las comparaciones de otros bloques
    for (let i = 0; i < this.comparaciones.length; i++) {
      if (i === currentComparisonIndex) continue; // omitir la comparación actual

      const comp = this.comparaciones[i];
      // Verificamos que en esa comparación estén definidas ambas columnas (el rango completo)
      if (comp.firstColumnSelected && comp.secondColumnSelected) {
        // Obtener índices de las columnas seleccionadas en esa comparación
        const index1 = this.currentColumns.findIndex(
          (c) => c.field === comp.firstColumnSelected
        );
        const index2 = this.currentColumns.findIndex(
          (c) => c.field === comp.secondColumnSelected
        );

        // Si ambos existen, definimos el rango
        if (index1 !== -1 && index2 !== -1) {
          const minIndex = Math.min(index1, index2);
          const maxIndex = Math.max(index1, index2);
          // Si la opción actual está dentro del rango, la deshabilitamos
          if (
            currentOptionIndex >= minIndex &&
            currentOptionIndex <= maxIndex
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
