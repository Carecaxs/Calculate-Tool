import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { SpreadsheetModule } from 'tabulator-tables';
import { CalculosService } from '../../../services/calculos.service';
import { ActivatedRoute } from '@angular/router';
import { TablaServiceService } from '../../../services/tabla-service.service';

@Component({
  selector: 'app-tabla',
  standalone: true,
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.css',
})
export class TablaComponent implements OnInit, AfterViewInit {
  @ViewChild('table') tableElement!: ElementRef;
  table!: Tabulator;
  mode: string = '';

  constructor(
    private calculosService: CalculosService,
    private tablaService: TablaServiceService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.mode = data['mode'] || '';
      this.tablaService.setMode(this.mode);

      //  Si la tabla ya existe, recargar datos y columnas
      if (this.table) {
        this.updateTable();
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.tableElement) {
      return;
    }

    Tabulator.registerModule([SpreadsheetModule]);

    this.createTable();
  }

  createTable(): void {
    const initialData = this.getInitialData();
    const columns = this.getColumns();

    this.table = new Tabulator(this.tableElement.nativeElement, {
      data: initialData,
      columns: columns,
      layout: 'fitDataFill',
      editTriggerEvent: 'dblclick',
      editorEmptyValue: undefined,
      selectableRange: true,
      selectableRangeColumns: true,
      selectableRangeRows: true,
      selectableRangeClearCells: true,
      clipboard: true,
      clipboardCopyStyled: false,
      clipboardCopyConfig: { rowHeaders: false, columnHeaders: false },
      clipboardCopyRowRange: 'range',
      clipboardPasteParser: 'range',
      clipboardPasteAction: 'range',
      history: true,
    });

    this.registerTableEvents();
  }

  updateTable(): void {
    const newData = this.getInitialData();
    const newColumns = this.getColumns();

    this.table.replaceData(newData);
    this.table.setColumns(newColumns);
    this.table.redraw(true);
  }

  getInitialData(): any[] {
    const data = [];
    switch (this.mode) {
      case 'porcentajes':
        for (let i = 0; i < 11; i++) {
          data.push({ id: i === 0 ? 'Base' : i });
        }
        break;
      case 'medias':
        for (let i = 0; i < 3; i++) {
          data.push({
            id: i === 0 ? 'Base' : i === 1 ? 'Media' : 'Desviación estándar',
          });
        }
        break;
      case 'medias-normas':
        for (let i = 0; i < 4; i++) {
          data.push({
            id:
              i === 0
                ? 'Base'
                : i === 1
                ? 'Media'
                : i === 2
                ? 'Desviación estándar'
                : 'Norma',
          });
        }
        break;
      case 'porcentajes-normas':
        for (let i = 0; i < 11; i++) {
          data.push({ id: i === 0 ? 'Base' : i });
        }
        break;
      default:
        for (let i = 0; i < 11; i++) {
          data.push({ id: i === 0 ? 'Base' : i });
        }
    }
    return data;
  }

  getColumns(): any[] {
    const baseColumns = [
      { title: 'Letras', field: 'id', headerSort: false, resizable: false },
    ];

    if (this.mode === 'medias-normas') {
      return [
        ...baseColumns,
        {
          title: 'A',
          field: 'a',
          headerSort: false,
          editor: 'number',
          resizable: false,
        },
      ];
    }

    if (this.mode === 'porcentajes-normas') {
      return this.buildPorcentajesNormasColumns();
    }

    return [
      ...baseColumns,
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
    ];
  }

  registerTableEvents(): void {
    this.table.on('tableBuilt', () => {
      this.calculosService.setData(this.table.getData());
      this.tablaService.setTableInstance(this.table);
      this.tablaService.setTablaLista(true);
    });

    this.table.on('dataChanged', () => {
      if (document.body.contains(this.tableElement.nativeElement)) {
        this.table.redraw(true);
      }
      this.calculosService.setData(this.table.getData());
      this.tablaService.setTableInstance(this.table);
      if (this.mode == 'porcentajes' || this.mode == 'medias') {
        this.tablaService.applyColorsToColumns(1);
      }
    });

    this.table.on('cellEdited', () => {
      this.table.redraw(true);
      this.calculosService.setData(this.table.getData());
      this.tablaService.setTableInstance(this.table);
      if (this.mode == 'porcentajes' || this.mode == 'medias') {
        this.tablaService.applyColorsToColumns(1);
      }
    });
  }

  // Ejemplo: genera "n" columnas de datos + sus columnas "Norma".
  // Si n=1 => A, A Norma
  // Si n=2 => A, A Norma, B, B Norma, etc.
  buildPorcentajesNormasColumns(): any[] {
    const columns = [
      {
        title: 'Letras',
        field: 'id',
        headerSort: false,
        resizable: false,
      },
    ];

    const letter = this.getLetterTitle(0); // A, B, ...

    return [
      ...columns,
      {
        title: letter,
        field: letter.toLowerCase(),
        headerSort: false,
        editor: 'number',
        resizable: false,
      },
      {
        title: letter + ' Norma',
        field: letter.toLowerCase() + '-norma',
        headerSort: false,
        editor: 'number',
        editable: (cell: any) => {
          // no editable si row.id === 'Base'
          const rowData = cell.getRow().getData();
          if (rowData.id === 'Base') {
            return false;
          }
          return 'number';
        },
        resizable: false,

        // Formatter personalizado para aplicar estilos
        formatter: (cell: any) => {
          const rowData = cell.getRow().getData();
          if (rowData.id === 'Base') {
            // Aplica el color gris y deshabilita la interacción
            cell.getElement().style.backgroundColor = '#E0E0E0';
            cell.getElement().style.pointerEvents = 'none';
          }
          // Retorna el valor formateado (puedes ajustar si requieres formato específico)
          return cell.getValue();
        },
      },
    ];
  }

  // Método auxiliar para convertir 0->A, 1->B, 2->C...
  private getLetterTitle(index: number): string {
    // Versión sencilla (solo 26 columnas máx):
    // index=0 => "A", 1=>"B"... 25=>"Z"
    let title = '';
    while (index >= 0) {
      title = String.fromCharCode((index % 26) + 65) + title;
      index = Math.floor(index / 26) - 1;
    }
    return title;
  }
}
