import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import {
  TabulatorFull as Tabulator,
  KeybindingsModule,
} from 'tabulator-tables';
import { SpreadsheetModule } from 'tabulator-tables';
import { TablaPorcetajesService } from '../../../services/tabla-porcetajes.service';
import { FormsModule } from '@angular/forms'; // 🔹 Importar FormsModule
import { row } from 'mathjs';
import { ButtonComponent } from '../../button/button.component'; // Importamos el componente hijo de botones
import { TablaServiceService } from '../../../services/tabla-service.service';

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.css',
})
export class TablaComponent implements AfterViewInit {
  @ViewChild('table') tableElement!: ElementRef; // Referencia al elemento HTML donde se insertará la tabla
  numeroDeFilas: number = 0; // Propiedad para el número de filas
  table!: Tabulator; //se inicializara antes de ser utilizada(!:)

  constructor(
    private tablaPorcentajeService: TablaPorcetajesService,
    private tablaService: TablaServiceService
  ) {} // Inyectamos el servicio en el constructor

  ngAfterViewInit(): void {
    Tabulator.registerModule([SpreadsheetModule]); //Permite activar características avanzadas de hojas de cálculo.

    //Datos para inicializar las filas en la tabla
    const initialData = [];
    for (let i = 0; i < 11; i++) {
      initialData.push({ id: i === 0 ? 'Base' : i }); // "Base" para la primera fila, números para las siguientes
    }

    this.table = new Tabulator(this.tableElement.nativeElement, {
      //accede al elemento div #table

      data: initialData, //le pasamos los datos inicializados
      columns: [
        { title: 'Letras', field: 'id', headerSort: false, resizable: false },
        {
          title: 'A',
          field: 'a',
          headerSort: false,
          editor: 'number',
          resizable: false,
        },
        {
          title: 'B',
          field: 'b',
          headerSort: false,
          editor: 'number',
          resizable: false,
        },
      ],
      //spreadsheet: true,

      layout: 'fitDataFill',
      editTriggerEvent: 'dblclick',
      editorEmptyValue: undefined,

      selectableRange: true,
      selectableRangeColumns: true,
      selectableRangeRows: true,
      selectableRangeClearCells: true,

      clipboard: true,
      clipboardCopyStyled: false,
      clipboardCopyConfig: {
        rowHeaders: false,
        columnHeaders: false,
      },
      clipboardCopyRowRange: 'range',
      clipboardPasteParser: 'range',
      clipboardPasteAction: 'range',

      history: true,
    });

    // Guardamos la tabla en el servicio despues de que se contruya completamente la tabla
    this.table.on('tableBuilt', () => {
      console.log('evento tableBuilt');

      const tableData = this.table.getData();
      this.tablaPorcentajeService.setDataWithoutCalculation(tableData); //Guardamos la tabla en el servicio tabla-porcentajes

      this.tablaService.setTableInstance(this.table); // Guardamos la tabla en el servicio tabla-service para tener la referencia de esta y poder manipularla
      this.tablaService.setTablaLista(true); // Notificamos que la tabla está lista
    });

    // Escuchar cuando los datos cambian (incluye pegado desde Excel)
    this.table.on('dataChanged', () => {
      this.table.redraw(true);
      const tableData = this.table.getData();
      console.log('evento dataChanged');
      this.tablaPorcentajeService.setDataWithoutCalculation(tableData); //Guardamos la tabla en el servicio tabla-porcentajes
      this.tablaService.setTableInstance(this.table); // Guardamos la tabla en el servicio tabla-service para tener la referencia de esta y poder manipularla

      //this.applyColorsToColumns();
    }); //fin

    // Registrar el evento `cellEdited` que escucha cuando una celda se modifica
    this.table.on('cellEdited', () => {
      this.table.redraw(true);
      // Actualiza automáticamente los datos en el servicio
      const tableData = this.table.getData();
      console.log('evento cellEdited');
      this.tablaPorcentajeService.setDataWithoutCalculation(tableData); //Guardamos la tabla en el servicio tabla-porcentajes
      this.tablaService.setTableInstance(this.table); // Guardamos la tabla en el servicio tabla-service para tener la referencia de esta y poder manipularla
    }); //fin
  }

  // private applyColorsToColumns(): void {
  //   this.table.getRows().forEach((row) => {
  //     // Para cada fila, actualizamos el color de las celdas según el servicio
  //     row.getCells().forEach((cell) => {
  //       const columnName = cell.getColumn().getField();
  //       const color = this.tablaPorcentajeService.getColorForColumn(columnName);
  //       // Actualiza el color de la celda
  //       if (color) {
  //         cell.getElement().style.backgroundColor = color;
  //       }
  //     });
  //   });
  // }
}
