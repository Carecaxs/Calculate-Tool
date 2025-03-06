import { Injectable } from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { TablaPorcetajesService } from './tabla-porcetajes.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TablaServiceService {
  private table!: Tabulator; // Referencia a la tabla Tabulator
  private tableComparacion!: Tabulator; // Referencia a la tabla comparacion porcentajes Tabulator
  private tableResultMedias!: Tabulator; // Referencia a la tabla resultados medias Tabulator

  private tablaListaSubject = new BehaviorSubject<boolean>(false); // Estado inicial: tabla no lista
  tablaLista$ = this.tablaListaSubject.asObservable(); // Observable para escuchar cambios

  mode: string = ''; //guarda en que seccion estamos: porcentajes, medias, normas

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

  // Método para establecer la instancia de la tabla comparacion
  setTableResultMediaInstance(table: Tabulator) {
    this.tableResultMedias = table;
  }

  //metodo para retornar las columnas de la tabla
  getColumnsData() {
    return this.table.getColumns();
  }

  // Notifica cuando la tabla está lista
  setTablaLista(estado: boolean) {
    this.tablaListaSubject.next(estado);
  }

  setMode(mode: string) {
    this.mode = mode;
  }

  // Método para aplicar colores a las columnas desde el servicio, recibe como parametro un indicador, 1 si quiere que se refleje el color solo en la tabla rincipal
  // recibe 2 para aplicar color a la tabla de resultado en porcentajes
  //recibe 3 para aplicar color a la tabla de resultado en medias
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

    if (indicador == 2) {
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

      return;
    }

    //recibe 3 se realizan la aplicacion del color a la tabla de resultados de medias
    //se realiza el mismo proceso pero para la tabla que refleja los resultados
    this.tableResultMedias.getRows().forEach((row) => {
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
    this.tablaPorcentajeService.setData(tableData); // Usar el servicio inyectado
  }

  //Metodo para agregar columnas a la tabla
  updateColumnCount(newColumnCount: number) {
    // 1. Obtener el número actual de columnas a partir de las definiciones existentes en la tabla.
    const currentColumnCount = this.table.getColumnDefinitions().length;

    // 2. Bloquear el redibujado para evitar que se renderice la tabla en cada actualización individual.
    // Esto agrupa todas las actualizaciones y mejora el rendimiento.
    this.table.blockRedraw();

    // 3. Si el nuevo número de columnas es mayor que el actual, debemos agregar columnas.
    if (newColumnCount > currentColumnCount) {
      const newColumns: any[] = [];

      // Iterar desde el número actual de columnas hasta el nuevo número deseado.
      for (let i = currentColumnCount; i < newColumnCount; i++) {
        // Generar automáticamente el título de la columna usando un método auxiliar.
        const newTitle = this.getColumnTitle(i - 1);
        // Convertir el título a minúsculas para usarlo como identificador (campo) en los datos.
        const newField = newTitle.toLowerCase();

        // Agregar la nueva columna al arreglo de columnas nuevas con las propiedades deseadas.
        newColumns.push({
          title: newTitle, // Título visible de la columna.
          field: newField, // Nombre del campo en el objeto de datos.
          headerSort: false, // Deshabilitar la ordenación al hacer clic en el encabezado.
          editor: 'number', // Asigna un editor de tipo "number" para esta columna.
          resizable: false, // Evitar que el usuario modifique el ancho de la columna.
        });
      }

      // 3.1. Obtener las columnas actuales (definiciones) de la tabla.
      const currentColumns = this.table.getColumnDefinitions();
      // 3.2. Combinar las columnas existentes con las nuevas y actualizar la tabla de una sola vez.
      this.table.setColumns([...currentColumns, ...newColumns]);

      // 3.3. Actualizar las filas para que cada una tenga los nuevos campos agregados con valor vacío.
      const rows = this.table.getRows();
      rows.forEach((row) => {
        let updateData: any = {};
        // Para cada nueva columna, agregamos una propiedad con el identificador y valor vacío.
        for (let i = currentColumnCount; i < newColumnCount; i++) {
          const newTitle = this.getColumnTitle(i - 1);
          const newField = newTitle.toLowerCase();
          updateData[newField] = ''; // Inicializamos con cadena vacía.
        }
        // Actualizamos la fila con todos los nuevos campos en una única operación.
        row.update(updateData);
      });
    }
    // 4. Si el nuevo número de columnas es menor que el actual, se deben eliminar las columnas sobrantes.
    else if (newColumnCount < currentColumnCount) {
      // Se obtiene el arreglo de columnas excedentes, a partir del índice newColumnCount hasta el final.
      const columnsToDelete = this.table.getColumns().slice(newColumnCount);
      // Se elimina cada columna sobrante.
      columnsToDelete.forEach((column) => column.delete());
    }

    // 5. Forzar una única actualización final de la tabla.
    // Esto "desbloquea" el redibujado y refresca la tabla en una sola operación.
    this.table.redraw(true);

    // 6. Actualizar la definición de columnas en el servicio asociado.
    // Esto es útil para que otros componentes o servicios conozcan el nuevo esquema de columnas.
    const updatedColumns = this.table
      .getColumnDefinitions()
      .map((col: any) => ({
        title: col.title,
        field: col.field,
        headerSort: false,
        resizable: false,
      }));
    this.tablaPorcentajeService.setColumns(updatedColumns);

    this.applyColorsToColumns(1);
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
    // Obtén todas las filas actuales de la tabla
    const rows = this.table.getRows();

    // Bloquear el redibujado para evitar múltiples reflows mientras actualizamos las filas
    this.table.blockRedraw();

    // Para cada fila, actualiza sus celdas (excepto "id") a undefined
    const cleanedData = rows.map((row) => {
      const data = row.getData();
      // Creamos un nuevo objeto con el id intacto
      const newData: any = { id: data['id'] };
      Object.keys(data).forEach((key) => {
        if (key !== 'id') {
          newData[key] = undefined;
        }
      });
      // Actualizamos la fila con el nuevo objeto
      row.update(newData);
      return newData;
    });

    this.table.redraw(true);

    // Reaplicar colores y resetear comparaciones
    this.restablecerColores();
    this.tablaPorcentajeService.resetComparaciones();
    if (this.mode === 'porcentajes') {
      this.tablaPorcentajeService.setData(cleanedData);
    } else {
      //si mode es 'medias'
      this.tablaPorcentajeService.actualizarTablaResultadosMedias(cleanedData);
    }
  }

  restablecerColores() {
    if (this.mode === 'porcentajes') {
      // Restablecer los colores de todas las celdas de la tabla principal, como la tabla de resultado para porcentajes la copia entonces si esta se limpia la de resultados tambien
      this.table.getRows().forEach((row) => {
        row.getCells().forEach((cell) => {
          cell.getElement().style.backgroundColor = ''; // Eliminar color de fondo
        });
      });
    } else {
      //if mode==='medias'
      if (this.tableResultMedias) {
        this.tableResultMedias.getRows().forEach((row) => {
          row.getCells().forEach((cell) => {
            cell.getElement().style.backgroundColor = ''; // Eliminar color de fondo
          });
        });
      }
    }
  }
}
