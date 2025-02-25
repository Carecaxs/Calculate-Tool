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
    this.restablecerColores();
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

  // Método para aplicar colores a las columnas desde el servicio, recibe como parametro un indicador, 1 si quiere que se refleje el color solo en la tabla rincipal
  // recibe 2 si quiere que se refleje en las dos tablas
  applyColorsToColumns(indicador: number): void {
    if (indicador == 1) {
      //se aplica colores en la tabla principal
      this.table.getRows().forEach((row) => {
        row.getCells().forEach((cell) => {
          const columnName = cell.getColumn().getField();
          const color =
            this.tablaPorcentajeService.getColorForComparation(columnName); // Usamos el método para obtener el color
          if (color) {
            cell.getElement().style.backgroundColor = color;
          }
        });
      });

      return;
    }

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
    let columns = this.table.getColumns(); // Obtiene todas las columnas

    // Si el número de columnas a agregar es mayor que el número actual
    if (newColumnCount > currentColumnCount) {
      for (let i = currentColumnCount; i < newColumnCount; i++) {
        const newTitle = this.getColumnTitle(i - 1); // Generar título automáticamente
        const newField = newTitle.toLowerCase(); // Convertir a minúscula para el campo

        // Agregar la nueva columna sin eliminar los datos existentes
        this.table.addColumn({
          title: newTitle,
          field: newField,
          headerSort: false,
          editor: 'number',
          resizable: false,
        });

        // Agregar valores vacíos a la nueva columna para todas las filas
        this.table.getRows().forEach((row) => {
          row.update({ [newField]: '' }); // Inicializa sin borrar datos de otras columnas
        });
      }
    }
    // Si el número de columnas a agregar es menor que el número actual
    else if (newColumnCount < currentColumnCount) {
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
  }

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

    this.restablecerColores();

    this.tablaPorcentajeService.setDataWithoutCalculation(cleanedData); // Actualiza el servicio con los nuevos datos
  }

  restablecerColores() {
    // Restablecer los colores de todas las celdas
    this.table.getRows().forEach((row) => {
      row.getCells().forEach((cell) => {
        cell.getElement().style.backgroundColor = ''; // Eliminar color de fondo
      });
    });
  }
}
