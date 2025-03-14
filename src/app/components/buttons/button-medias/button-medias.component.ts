import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 🔹 Importar FormsModule
import { CommonModule } from '@angular/common';

import { TablaServiceService } from '../../../services/tabla-service.service'; // 🔹 Importar FormsModule
import { CalculosService } from '../../../services/calculos.service';

@Component({
  selector: 'app-button-medias',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './button-medias.component.html',
  styleUrl: './button-medias.component.css',
})
export class ButtonMediasComponent {
  numeroDeColumnas: number = 2; // esta variable se sincroniza con el input de cantidad de columnas
  columnaOptions: number[] = Array.from({ length: 30 }, (_, i) => i + 2); // propiedad que Genera las opciones de columna [2, 3, ..., 30]

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
    private calculosService: CalculosService
  ) {}

  ngAfterViewInit() {
    this.tablaService.tablaLista$.subscribe((estado) => {
      if (estado) {
        //limpiar las tablas por si tienen datos
        this.limpiarDatos();

        setTimeout(() => {
          this.cargarColumnasActuales();
        });
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

  //metodo para actualizar la cantidad de columnas, recibe el nuevo numero de columnas, tiene que ser mayor a 1
  actualizarColumnas(numeroDeColumnas: number) {
    //  Guardar la cantidad actual de columnas ANTES de modificar nada
    const oldColumnCount = this.currentColumns.length;

    this.tablaService.updateColumnCount(Number(numeroDeColumnas) + 1);
    this.cargarColumnasActuales();

    //Compara la nueva cantidad con la anterior
    const newColumnCount = this.currentColumns.length;
    if (newColumnCount < oldColumnCount) {
      // Se han reducido columnas, así que revisamos comparaciones desde el servicio
      //esto para que no hayan comparaciones validas de alguna columna que ya no exista
      this.verificarComparacionesInvalidas();
      this.ejecutarCalculo();
    } else {
      //en caso de aumentar las columnas se vuelven a filtrar las comparaciones validas, esto para asegurar que el servicio tenga todas las comparaciones
      this.onComparacionesDifSig();
    }
  }

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

    //identificar si se eliminaron comparaciones para actualizar las comparaciones validas en el servicio
    //obtener el size de las comparaciones actualizadas y las antiguas
    const comparacionesAhora = this.comparaciones.length;
    const comparacionesAntes = this.calculosService.getComparaciones().length;
    if (comparacionesAhora < comparacionesAntes) {
      //si se eliminaron comparaciones se actualizan las comparaciones en el servicio, se eliminan los estilos asignados a las comparaciones ya no existentes

      // Filtrar solo las comparaciones completas (cuando ambas columnas están seleccionadas)
      const comparacionesValidas = this.filtrarComparacionesValidas();

      //actualizar comparaciones en el servicio
      this.calculosService.setComparaciones(comparacionesValidas);
      //actualizar los colores (eliminar los colores de las comparaciones no existentes)
      this.tablaService.applyColorsToColumns(1);

      //tambien se actualiza el calculo
      this.ejecutarCalculo();
    }
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

    this.calculosService.setComparaciones(comparacionesValidas);
    this.tablaService.applyColorsToColumns(1);
  }

  //ejecuta el calculo con las comparaciones contenidas
  ejecutarCalculo() {
    this.enviarDS();
    //se envia los datos de la tabla original y los elementos de comparacion
    const data = this.tablaService.getTableInstance();

    this.calculosService.ejecutarCalculoMedias(data.getData());

    //aplicar los colores seleccionado a las columnas de las tablas
    this.tablaService.applyColorsToColumns(3);
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

  //este metodo va ser usado al reducir la cantidad de columnas para validar que no este una columna que ya no exista dentro de comparaciones validas
  verificarComparacionesInvalidas() {
    //obtenemos las comparaciones exitentes validadas desde el servicio
    const comparaciones = this.calculosService.getComparaciones();

    //variable a retornar
    let hayComparacionesInvalidas = false;

    // Recorremos cada comparación y vemos si col1 o col2 sigue existiendo
    for (const comp of comparaciones) {
      // Verifica col1
      const col1Existe = this.currentColumns.some(
        (col) => col.field === comp.col1
      );
      // Verifica col2
      const col2Existe = this.currentColumns.some(
        (col) => col.field === comp.col2
      );

      if (!col1Existe || !col2Existe) {
        // Esta comparación hace referencia a columnas que ya no existen
        hayComparacionesInvalidas = true;
        break; // No necesitamos chequear más
      }
    }

    if (hayComparacionesInvalidas) {
      // conservar solo las comparaciones válidas:
      const comparacionesValidas = comparaciones.filter((comp) => {
        const col1Existe = this.currentColumns.some(
          (col) => col.field === comp.col1
        );
        const col2Existe = this.currentColumns.some(
          (col) => col.field === comp.col2
        );
        return col1Existe && col2Existe;
      });
      this.calculosService.setComparaciones(comparacionesValidas);
    }
  }

  //funcion para enviar la diferencia significativa al servicio
  enviarDS() {
    this.calculosService.setDiferenciaSifnificativa(
      this.diferenciaSeleccionada
    );
  }
}
