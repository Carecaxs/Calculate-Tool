import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { SpreadsheetModule } from 'tabulator-tables';
import { TablaPorcetajesService } from '../../../services/tabla-porcetajes.service';
import { TablaServiceService } from '../../../services/tabla-service.service';

@Component({
  selector: 'app-tabla-comparacion',
  standalone: true,
  imports: [],
  templateUrl: './tabla-comparacion.component.html',
  styleUrl: './tabla-comparacion.component.css',
})
export class TablaComparacionComponent implements AfterViewInit {
  @ViewChild('table') tableElement!: ElementRef;
  constructor(
    private tablaPorcentajeService: TablaPorcetajesService,
    private tablaService: TablaServiceService
  ) {}
  table!: Tabulator;

  ngAfterViewInit(): void {
    Tabulator.registerModule([SpreadsheetModule]);

    this.table = new Tabulator(this.tableElement.nativeElement, {
      data: [], //inserta los datos procesados
      columns: [
        { title: 'Letras', field: 'id', headerSort: false, resizable: false },
        { title: 'A', field: 'a', headerSort: false, resizable: false },
        { title: 'B', field: 'b', headerSort: false, resizable: false },
      ],
      layout: 'fitDataFill',

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
      clipboardPasteAction: undefined,
    });

    this.table.on('tableBuilt', () => {
      // Escuchar cambios en las columnas después de que la tabla se construyó
      this.tablaPorcentajeService.columns$.subscribe(
        (columnsFromFirstTable) => {
          if (columnsFromFirstTable.length > 0) {
            const updatedColumns = columnsFromFirstTable.map((col) => ({
              ...col,
              editor: false, // Deshabilitamos la edición en la tabla de comparación
            }));
            this.table.setColumns(updatedColumns);
          }
        }
      );

      // Escuchar cambios en los datos después de que la tabla se construyó
      this.tablaPorcentajeService.data$.subscribe((dataFromFirstTable) => {
        if (dataFromFirstTable.length > 0) {
          this.table.setData(dataFromFirstTable);
          this.tablaService.setTableComparacionInstance(this.table);
          this.table.redraw(true);

          this.tablaService.applyColorsToColumns(2);
        }
      });
    });
  }
}
