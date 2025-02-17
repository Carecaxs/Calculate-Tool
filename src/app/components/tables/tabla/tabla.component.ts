import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
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
  styleUrl: './tabla.component.css'
})


export class TablaComponent implements AfterViewInit {
  @ViewChild('table') tableElement!: ElementRef; // Referencia al elemento HTML donde se insertará la tabla
  numeroDeFilas: number = 0;  // Propiedad para el número de filas
  table!: Tabulator; //se inicializara antes de ser utilizada(!:)

  constructor(private tablaPorcentajeService: TablaPorcetajesService,
              private tablaService: TablaServiceService) { } // Inyectamos el servicio en el constructor

  ngAfterViewInit(): void {

    Tabulator.registerModule([SpreadsheetModule]);//Permite activar características avanzadas de hojas de cálculo.



    //Datos para inicializar las filas en la tabla
    const initialData = [];
    for (let i = 0; i < 11; i++) {
      initialData.push({ id: i === 0 ? 'Base' : i }); // "Base" para la primera fila, números para las siguientes
    }

    this.table = new Tabulator(this.tableElement.nativeElement, { //accede al elemento div #table


      data: initialData,//le pasamos los datos inicializados
      columns: [
        { title: 'Letras', field: 'id', headerSort: false, resizable: false },
        {
          title: 'A', field: 'a', headerSort: false, editor: "number", resizable: false,
          /*formatter: (cell) => {
            const cellElement = cell.getElement();
            cellElement.style.backgroundColor = "lightgreen"; // Fondo
            cellElement.style.color = "black"; // Color de texto
            cellElement.style.border = "1px solid rgba(0, 0, 0, 0.1)"; // Bordes
            return cell.getValue();
          },*/
        },
        { title: 'B', field: 'b', headerSort: false, editor: "number", resizable: false },

      ],
      spreadsheet: true,

      layout: 'fitDataFill',

      editTriggerEvent: "dblclick",
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
      clipboardCopyRowRange: "range",
      clipboardPasteParser: "range",
      clipboardPasteAction: "range",


      history: true,


    });

    this.tablaService.setTableInstance(this.table); // Guardamos la tabla en el servicio


 

    // Escuchar cuando los datos cambian (incluye pegado desde Excel)
    this.table.on('dataChanged', () => {
      const tableData = this.table.getData();
      this.tablaPorcentajeService.setData(tableData);  //Guardamos la tabla en el servicio tabla-porcentajes
      this.tablaService.setTableInstance(this.table); // Guardamos la tabla en el servicio tabla-service

    });//fin

    // Registrar el evento `cellEdited` que escucha cuando una celda se modifica
    this.table.on('cellEdited', () => {
      // Actualiza automáticamente los datos en el servicio
      const tableData = this.table.getData();
      this.tablaPorcentajeService.setData(tableData);  //Guardamos la tabla en el servicio tabla-porcentajes
      this.tablaService.setTableInstance(this.table); // Guardamos la tabla en el servicio tabla-service para tener la referencia de esta y poder manipularla

      this.table.redraw(true); // Redibuja la tabla

    });//fin


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

  //Metodo para agregar columnas a la tabla
  addColumn() {
    const currentColumnCount = this.table.getColumnDefinitions().length; // Número actual de columnas
    const newTitle = this.getColumnTitle(currentColumnCount - 1); // Generar título automáticamente
    const newField = newTitle.toLowerCase(); // Convertir a minúscula para el campo

    this.table.addColumn({
      title: newTitle,
      field: newField,
      headerSort: false,
      editor: 'number',
      resizable: false
    });


    // Actualizar columnas en el servicio
    const updatedColumns = this.table.getColumnDefinitions().map((col: any) => ({
      title: col.title,
      field: col.field,
      headerSort: false,
      resizable: false
    }));
    this.tablaPorcentajeService.setColumns(updatedColumns);

    // this.table.getColumns().map(column=>{
    //   console.log(column.getField());
    //   console.log(column.getDefinition().title);
    // });
  }//fin metodo add


  eliminarColumn() {
    const columnDefinitions = this.table.getColumnDefinitions();

    // Verifica que haya más de una columna (para no eliminar la columna fija `id`)
    if (columnDefinitions.length > 1) {
      const lastColumn = columnDefinitions[columnDefinitions.length - 1]; // Obtiene la última columna

      if (lastColumn.field) { // Asegura que el campo no sea undefined
        this.table.deleteColumn(lastColumn.field); // Elimina la última columna

        // Actualiza las columnas en el servicio
        const updatedColumns = this.table.getColumnDefinitions().map((col: any) => ({
          title: col.title,
          field: col.field,
          headerSort: false,
          resizable: false,
        }));
        this.tablaPorcentajeService.setColumns(updatedColumns);
      }
    }

  }//fin metodo add









}
