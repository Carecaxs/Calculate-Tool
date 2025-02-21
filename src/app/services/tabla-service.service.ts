import { Injectable } from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { TablaPorcetajesService } from './tabla-porcetajes.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TablaServiceService {
  private table!: Tabulator; // Referencia a la tabla Tabulator
  private tableComparacion!: Tabulator; // Referencia a la tabla comparacion Tabulator

  private tablaListaSubject = new BehaviorSubject<boolean>(false); // Estado inicial: tabla no lista
  tablaLista$ = this.tablaListaSubject.asObservable(); // Observable para escuchar cambios

  constructor(private tablaPorcentajeService: TablaPorcetajesService) {} // Inyectar el servicio

  // Método para establecer la instancia de la tabla
  setTableInstance(table: Tabulator) {
    this.table = table;
  }

  // Método para obtener la instancia de la tabla
  getTableInstance(): Tabulator {
    return this.table;
  }

  // Método para establecer la instancia de la tabla comparacion
  setTableComparacionInstance(table: Tabulator) {
    this.tableComparacion = table;
  }

  //metodo para retornar las columnas de la tabla
  getColumnsData() {
    return this.table.getColumns();
  }

  // Notifica cuando la tabla está lista
  setTablaLista(estado: boolean) {
    this.tablaListaSubject.next(estado);
  }

  // Método para aplicar colores a las columnas desde el servicio
  applyColorsToColumns(): void {
    //desde la instancia de la tabla original modifica las columnas seleccionadas de comparacion y se le aplica el color elegido
    // this.table.getRows().forEach((row) => {
    //   row.getCells().forEach((cell) => {
    //     const columnName = cell.getColumn().getField();
    //     const color =
    //       this.tablaPorcentajeService.getColorForComparation(columnName); // Usamos el método para obtener el color
    //     if (color) {
    //       cell.getElement().style.backgroundColor = color;
    //     }
    //   });
    // });

    //se realiza el mismo proceso pero para la tabla que refleja los resultados
    this.tableComparacion.getRows().forEach((row) => {
      row.getCells().forEach((cell) => {
        const columnName = cell.getColumn().getField();
        const color =
          this.tablaPorcentajeService.getColorForComparation(columnName); // Usamos el método para obtener el color
        if (color) {
          cell.getElement().style.backgroundColor = color;
        }
      });
    });
  }

  // Método para actualizar la cantidad de filas en la tabla
  updateRowCount(newRowCount: number) {
    const currentRows = this.table.getDataCount(); // Obtiene la cantidad actual de filas
    newRowCount += 1; // Suma 1 porque la primera fila está reservada para "Base"

    if (currentRows < newRowCount) {
      // Si hay menos filas de las necesarias, agregar filas
      for (let i = currentRows; i < newRowCount; i++) {
        this.table.addRow({ id: i });
      }
    } else if (currentRows > newRowCount) {
      // Si hay más filas de las necesarias, eliminar las sobrantes
      let rows = this.table.getRows(); // Obtiene todas las filas
      let rowsToDelete = rows.slice(newRowCount); // Toma las filas que exceden la cantidad deseada

      rowsToDelete.forEach((row) => row.delete()); // Elimina cada fila sobrante
    }

    //  Sincronizar con la tabla de comparación
    const tableData = this.table.getData();
    this.tablaPorcentajeService.setDataWithoutCalculation(tableData); // Usar el servicio inyectado
  }

  //Metodo para agregar columnas a la tabla
  updateColumnCount(newColumnCount: number) {
    const currentColumnCount = this.table.getColumnDefinitions().length; // Número actual de columnas

    // Si el número de columnas a agregar es mayor que el número actual
    if (newColumnCount > currentColumnCount) {
      // Agregar las columnas adicionales
      for (let i = currentColumnCount; i < newColumnCount; i++) {
        const newTitle = this.getColumnTitle(i - 1); // Generar título automáticamente
        const newField = newTitle.toLowerCase(); // Convertir a minúscula para el campo

        console.log(newField);

        // Agregar la nueva columna
        this.table.addColumn({
          title: newTitle,
          field: newField,
          headerSort: false,
          editor: 'number',
          resizable: false,
        });
      }
    }
    // Si el número de columnas a agregar es menor que el número actual
    else if (newColumnCount < currentColumnCount) {
      // Si hay más columnas de las necesarias, eliminar las sobrantes
      let columns = this.table.getColumns(); // Obtiene todas las columnas
      let columnsToDelete = columns.slice(newColumnCount); // Toma las columnas que exceden la cantidad deseada

      columnsToDelete.forEach((column) => column.delete()); // Elimina cada columna sobrante
    }

    // Actualizar columnas en el servicio después de agregar o eliminar
    const updatedColumns = this.table
      .getColumnDefinitions()
      .map((col: any) => ({
        title: col.title,
        field: col.field,
        headerSort: false,
        resizable: false,
      }));
    this.tablaPorcentajeService.setColumns(updatedColumns);
  } //fin metodo add

  // Método para generar el título de la columna basado en el abecedario
  getColumnTitle(index: number): string {
    let title = '';
    while (index >= 0) {
      title = String.fromCharCode((index % 26) + 65) + title; // Convierte el índice en letras
      index = Math.floor(index / 26) - 1;
    }
    return title;
  }

  limpiarDatosTabla() {
    // Obtener los datos actuales de la tabla
    const currentData = this.table.getData();

    // Limpiar los datos pero mantener el valor del campo 1 (id)
    const cleanedData = currentData.map((row) => {
      const cleanedRow = { ...row }; // Copiar la fila
      // Recorremos las columnas y limpiamos todos los valores excepto el campo "id"
      Object.keys(cleanedRow).forEach((key) => {
        if (key !== 'id') {
          cleanedRow[key] = ''; // Limpiamos el valor, dejando el campo 'id' intacto
        }
      });
      return cleanedRow; // Devolvemos la fila limpiada
    });

    // Actualizamos la tabla con los datos modificados
    this.table.setData(cleanedData);

    this.tablaPorcentajeService.setDataWithoutCalculation(cleanedData); // Actualiza el servicio con los nuevos datos
  }
}
