import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { SpreadsheetModule } from 'tabulator-tables';
import { CalculosService } from '../../../services/calculos.service';
import { TablaService } from '../../../services/tabla.service';

@Component({
  selector: 'app-tabla-resultado-porcentajes-medias',
  standalone: true,
  imports: [],
  templateUrl: './tabla-resultado-porcetajes-medias.component.html',
  styleUrl: './tabla-resultado-porcetajes-medias.component.css',
})
export class TablaResultadoPorcentajeMediasComponent implements AfterViewInit {
  @ViewChild('table') tableElement!: ElementRef;
  table!: Tabulator;
  mode: string = '';

  constructor(
    private calculosService: CalculosService,
    private tablaService: TablaService
  ) {}

  ngOnInit(): void {
    // Se obtiene el modo ('porcentajes' o 'medias') desde el servicio
    this.mode = this.tablaService.getMode();
  }

  ngAfterViewInit(): void {
    // Registrar el módulo necesario de Tabulator
    Tabulator.registerModule([SpreadsheetModule]);

    // Inicializar la tabla y luego configurar eventos
    this.initializeTable();
    this.setupAutoScroll();
    this.setupTableBuiltSubscriptions();
  }

  /**
   * Inicializa la tabla con la configuración base.
   * Agrega 'columnDefaults' si el modo es 'medias'.
   */
  private initializeTable(): void {
    const baseConfig: any = {
      data: [],
      columns: [
        {
          title: 'Letras',
          field: 'id',
          headerSort: false,
          resizable: false,
          formatter: 'html',
        },
        {
          title: 'A',
          field: 'a',
          headerSort: false,
          resizable: false,
          formatter: 'html',
        },
        {
          title: 'B',
          field: 'b',
          headerSort: false,
          resizable: false,
          formatter: 'html',
        },
      ],
      rowContextMenu: [
        {
          label: 'Copiar selección',
          action: (e: UIEvent, _row: any) =>
            (this.table as any).copyToClipboard(),
        },
      ],
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
    };

    // Para el modo 'medias' se añaden defaults para las columnas
    if (this.mode === 'medias') {
      baseConfig.columnDefaults = {
        minWidth: 70,
        resizable: false,
        headerSort: false,
        formatter: 'html',
      };
    }

    this.table = new Tabulator(this.tableElement.nativeElement, baseConfig);
  }

  /**
   * Configura los eventos de auto-scroll para la tabla mientras se seleccionan celdas.
   */
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

  /**
   * Configura las suscripciones y acciones que se ejecutan cuando la tabla está construida.
   * Se suscribe a columnas y, dependiendo del modo, a la fuente de datos correspondiente.
   */
  private setupTableBuiltSubscriptions(): void {
    this.table.on('tableBuilt', () => {
      // Actualiza columnas a partir del observable columns$
      this.tablaService.columns$.subscribe((columnsFromFirstTable) => {
        if (columnsFromFirstTable.length > 0) {
          const updatedColumns = columnsFromFirstTable.map((col: any) => ({
            ...col,
            editor: false,
            formatter: 'html',
          }));
          this.table.setColumns(updatedColumns);
        }
      });

      if (this.mode === 'porcentajes') {
        // Modo 'porcentajes': se suscribe a data$ y se aplican configuraciones de comparación
        this.calculosService.data$.subscribe((dataFromFirstTable) => {
          if (dataFromFirstTable.length > 0) {
            this.table.setData(dataFromFirstTable);
            this.tablaService.setTableComparacionInstance(this.table);
            this.table.redraw(true);
            this.tablaService.applyColorsToColumns(2);
          }
        });
      } else if (this.mode === 'medias') {
        // Modo 'medias': se suscribe a resultados$ y se registra la instancia para resultados
        this.calculosService.resultados$.subscribe((nuevaData) => {
          this.table.setData(nuevaData);
        });
        this.tablaService.setTableResultMediaInstance(this.table);
      }
    });
  }

  /**
   * Copia todos los datos de la tabla al portapapeles,
   * eliminando etiquetas HTML y formateando las celdas.
   */
  copiarTabla(): void {
    const stripHTML = (html: string): string => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || '';
    };

    const tableData = this.table.getData();
    if (!tableData || tableData.length === 0) {
      console.warn('⚠️ No hay datos para copiar.');
      return;
    }

    const filteredData = tableData.map((row: any) => {
      const rowCopy = { ...row };
      delete rowCopy['id'];
      return Object.values(rowCopy);
    });

    const textToCopy = filteredData
      .map((row: any) =>
        row
          .map((cell: any) => {
            let valor = String(cell ?? '');
            valor = stripHTML(valor);
            valor = valor.replace(/\r?\n/g, ' ');
            return valor;
          })
          .join('\t')
      )
      .join('\n');

    navigator.clipboard.writeText(textToCopy).catch((err) => {
      console.error('❌ Error al copiar:', err);
    });
  }
}
