import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { SpreadsheetModule, Tabulator } from 'tabulator-tables';
import { CalculosService } from '../../../services/calculos.service';
import { TablaServiceService } from '../../../services/tabla-service.service';

@Component({
  selector: 'app-tabla-resultado-norma',
  standalone: true,
  templateUrl: './tabla-resultado-norma.component.html',
  styleUrls: ['./tabla-resultado-norma.component.css'],
})
export class TablaResultadoNormaComponent implements OnInit, AfterViewInit {
  @ViewChild('table') tableElement!: ElementRef;
  table!: Tabulator;
  mode: string = '';

  constructor(
    private calculosService: CalculosService,
    private tablaService: TablaServiceService
  ) {}

  ngOnInit(): void {
    this.mode = this.tablaService.getMode();
  }

  ngAfterViewInit(): void {
    Tabulator.registerModule([SpreadsheetModule]);

    const columns = this.getColumnsForMode();
    this.initializeTable(columns);
    this.setupAutoScroll();
    this.setupSubscriptions();
  }

  // Se encarga de crear la tabla con la definición de columnas inicial
  private initializeTable(columns: any[]): void {
    this.table = new Tabulator(this.tableElement.nativeElement, {
      data: [], // se llenará después
      columnDefaults: {
        minWidth: 70,
        resizable: false,
        headerSort: false,
        formatter: 'html',
      },
      columns: columns,
      layout: 'fitDataFill',
      selectableRange: true,
      selectableRangeColumns: true,
      selectableRangeRows: true,
      selectableRangeClearCells: true,
      clipboard: true,
      clipboardCopyStyled: true,
      clipboardCopyRowRange: 'range',
      clipboardCopyConfig: { rowHeaders: false, columnHeaders: false },
      clipboardPasteParser: 'range',
      clipboardPasteAction: undefined,
      rowContextMenu: [
        {
          label: 'Copiar selección',
          action: (e: UIEvent, _row: any) =>
            (this.table as any).copyToClipboard(),
        },
      ],
      history: true,
    });
  }

  // Extrae la definición de columnas según el modo
  private getColumnsForMode(): any[] {
    // Por ejemplo, en "medias-normas" mostramos solo "Letras" y "A",
    // en "porcentajes-normas" mostramos "Letras", "A" y "A Norma".
    if (this.mode === 'medias-normas') {
      return [
        { title: 'Letras', field: 'id' },
        { title: 'A', field: 'a' },
      ];
    } else {
      return [
        { title: 'Letras', field: 'id' },
        { title: 'A', field: 'a' },
        { title: 'A Norma', field: 'a-norma' },
      ];
    }
  }

  // Configura el auto-scroll para la tabla
  private setupAutoScroll(): void {
    let isSelecting = false;
    let scrollInterval: any = null;
    const scrollSpeed = 20;

    this.table.on('cellMouseDown', () => {
      isSelecting = true;
    });
    this.table.on('cellMouseUp', () => {
      isSelecting = false;
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
    });
    this.table.on('cellMouseMove', (e: UIEvent) => {
      if (!isSelecting) return;
      const mouseEvent = e as MouseEvent;
      const tableContainer = this.tableElement.nativeElement.querySelector(
        '.tabulator-tableholder'
      );
      if (!tableContainer) return;
      const rect = tableContainer.getBoundingClientRect();
      const mouseX = mouseEvent.clientX;
      const mouseY = mouseEvent.clientY;
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
      scrollInterval = setInterval(() => {
        let moved = false;
        if (mouseX < rect.left + 50) {
          tableContainer.scrollLeft -= scrollSpeed;
          moved = true;
        } else if (mouseX > rect.right - 50) {
          tableContainer.scrollLeft += scrollSpeed;
          moved = true;
        }
        if (mouseY < rect.top + 50) {
          tableContainer.scrollTop -= scrollSpeed;
          moved = true;
        } else if (mouseY > rect.bottom - 50) {
          tableContainer.scrollTop += scrollSpeed;
          moved = true;
        }
        if (!moved) {
          clearInterval(scrollInterval);
          scrollInterval = null;
        }
      }, 50);
    });
    const tableContainer = this.tableElement.nativeElement.querySelector(
      '.tabulator-tableholder'
    );
    if (tableContainer) {
      tableContainer.addEventListener('mouseleave', () => {
        if (scrollInterval) {
          clearInterval(scrollInterval);
          scrollInterval = null;
        }
      });
    }
  }

  // Configura las suscripciones para que la tabla de resultados "escuche" cambios en columnas y data.
  private setupSubscriptions(): void {
    this.table.on('tableBuilt', () => {
      // Si el modo NO es "porcentajes-normas", usamos las columnas del observable,
      // de lo contrario, se mantiene la definición manual.

      this.calculosService.columns$.subscribe((columnsFromOriginal) => {
        if (columnsFromOriginal && columnsFromOriginal.length > 0) {
          const updatedColumns = columnsFromOriginal.map((col) => ({
            ...col,
            editor: false,
            formatter: 'html',
          }));
          this.table.setColumns(updatedColumns);
        }
        this.tablaService.setTableResultMediaInstance(this.table);
      });

      // Suscribirse al observable de resultados para actualizar la data
      this.calculosService.resultados$.subscribe((nuevaData) => {
        this.table.setData(nuevaData);
      });
    });
  }
}
