import { Injectable } from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { TablaPorcetajesService } from './tabla-porcetajes.service';


@Injectable({
  providedIn: 'root'
})
export class TablaServiceService {

  private table!: Tabulator; // Referencia a la tabla Tabulator


  constructor(private tablaPorcentajeService: TablaPorcetajesService) { } // Inyectar el servicio

  // Método para establecer la instancia de la tabla
  setTableInstance(table: Tabulator) {
    this.table = table;
  }


  // Método para obtener la instancia de la tabla
  getTableInstance(): Tabulator {
    return this.table;
  }


  //metodo para retornar las columnas de la tabla
  getColumnsData(){
    return this.table.getColumns();
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

      rowsToDelete.forEach(row => row.delete()); // Elimina cada fila sobrante
    }


    //  Sincronizar con la tabla de comparación
    const tableData = this.table.getData();
    this.tablaPorcentajeService.setData(tableData); // Usar el servicio inyectado


  }




}
