import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { SpreadsheetModule } from 'tabulator-tables';
import { TablaPorcetajesService } from '../../../services/tabla-porcetajes.service';
import { FormsModule } from '@angular/forms'; // 🔹 Importar FormsModule
import { row } from 'mathjs';


@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.css'
})
export class TablaComponent implements AfterViewInit {
  @ViewChild('table') tableElement!: ElementRef; // Decorador que obtiene la referencia de un elemento del DOM
  numeroDeFilas: number = 0;  // Propiedad para el número de filas
  table!: Tabulator; //se inicializara antes de ser utilizada(!:)

  constructor(private tablaPorcentajeService: TablaPorcetajesService) { }

  ngAfterViewInit(): void {

    Tabulator.registerModule([SpreadsheetModule]);



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


    // Escuchar cuando los datos cambian (incluye pegado desde Excel)
    this.table.on('dataChanged', () => {
      const tableData = this.table.getData();
      this.tablaPorcentajeService.setData(tableData);
    });//fin

    // Registrar el evento `cellEdited` que escucha cuando una celda se modifica
    this.table.on('cellEdited', () => {
      // Actualiza automáticamente los datos en el servicio
      const tableData = this.table.getData();
      this.tablaPorcentajeService.setData(tableData);

      this.table.redraw(true); // Redibuja la tabla

      //prueba para ver datos
      console.log(this.table.getData());//obtiene el array
      console.log(tableData.find(fila => fila.id === "Base"));//busca la coincidencia
      console.log(tableData.filter(fila => fila.id != "Base"));//cumple la condicion
      //fin prueba
    });//fin


  }


  addfila() {
    const rowCount = this.table.getDataCount(); // Cuenta el número actual de filas

    const newRow = { id: rowCount }; // Genera un nuevo ID basado en el número de filas
    console.log(newRow);

    const jaja = { id: 12 };
    console.log(jaja);
    this.table.addRow(newRow); // Agrega la fila a la tabla principal

    // Sincroniza las filas con la tabla de comparación
    const tableData = this.table.getData();
    this.tablaPorcentajeService.setData(tableData); // Envia los datos actualizados al servicio
  }


  updateRowCount(newRowCount: number) {
    const currentRows = this.table.getDataCount(); // Obtiene la cantidad actual de filas
    newRowCount += 1;// se le suma uno a la cantidad que el usuario ingresa ya que el programa no toma en cuenta la primer fila ya que esta destinada a base
    let newRow; //almacena la referencia 
    console.log(newRowCount);
    console.log(currentRows);

    if (currentRows < newRowCount) {

      // Agregar filas hasta alcanzar newRowCount
      for (let i = currentRows; i < newRowCount; i++) {

        newRow = { id: i };
        this.table.addRow(newRow);// Crea la nueva fila con un ID único     
      }



    } else if (currentRows > newRowCount) {


      let rows = this.table.getRows();//se obtiene una referencia de las filas de la tabla

      //se toma las filas que estan adelante del numero que ingreas el usuario
      //ejemplo se ingresa 3, se toma de la 4 en adelante
      let rowsToDelete = rows.slice(newRowCount);


      rowsToDelete.forEach(row => {
        row.delete();  // Elimina la fila
      });

      console.log(this.table.getRows());

    }

    // Sincronizar con la tabla de comparación
    const tableData = this.table.getData();
    this.tablaPorcentajeService.setData(tableData);
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
