import { Component, ElementRef, ViewChild } from '@angular/core';
import { SpreadsheetModule, Tabulator } from 'tabulator-tables';
import { CalculosService } from '../../../services/calculos.service';
import { TablaService } from '../../../services/tabla.service';

@Component({
  selector: 'app-tabla-resultado-norma',
  standalone: true,
  imports: [],
  templateUrl: './tabla-resultado-norma.component.html',
  styleUrl: './tabla-resultado-norma.component.css',
})
export class TablaResultadoNormaComponent {
  @ViewChild('table') tableElement!: ElementRef;
  table!: Tabulator;
  mode: string = '';

  constructor(
    private calculosService: CalculosService,
    private tablaService: TablaService
  ) {}

  ngOnInit(): void {
    this.mode = this.tablaService.getMode();
  }

  ngAfterViewInit(): void {
    Tabulator.registerModule([SpreadsheetModule]);

    // obtener columnas segun la seccion en normas que este (porcentajes o medias)
    const columns = this.getColumnsForMode();

    //inicializar la tabla y configurarla
    this.initializeTable(columns);

    //configurar el scroll en la tabla
    this.setupAutoScroll();

    //manejar camibios en la tabla (recibir datos)
    this.setupSubscriptions();
  }

  // Se encarga de crear la tabla con la definición de columnas inicial
  private initializeTable(columns: any[]): void {
    this.table = new Tabulator(this.tableElement.nativeElement, {
      data: [], // se llenará después
      columnDefaults: {
        minWidth: 78,
        resizable: false,
        headerSort: false,
        formatter: 'html',
      },
      columns: columns,
      layout: 'fitDataFill',
      rowFormatter: (row) => {
        const rowData = row.getData();
        // Si es la fila "Base", aplicamos estilo a las columnas que terminen en "-norma"
        if (rowData['id'] === 'Base') {
          row.getCells().forEach((cell) => {
            const field = cell.getColumn().getField();
            if (field && field.endsWith('-norma')) {
              cell.getElement().style.backgroundColor = '#E0E0E0';
              cell.getElement().style.pointerEvents = 'none';
            }
          });
        }
      },
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

  //este metodo copia todos los datos de la tabla
  copiarTabla() {
    // Función auxiliar para eliminar etiquetas HTML
    const stripHTML = (html: string): string => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || '';
    };

    // Obtener datos de la tabla
    const tableData = this.table.getData();
    if (!tableData || tableData.length === 0) {
      console.warn('⚠️ No hay datos para copiar.');
      return;
    }

    // Eliminar la columna "id" y convertir cada fila en un array de valores
    const filteredData = tableData.map((row) => {
      const rowCopy = { ...row };
      delete rowCopy['id'];
      return Object.values(rowCopy);
    });

    // Convertir cada celda a string, quitar HTML, eliminar saltos de línea y unir
    const textToCopy = filteredData
      .map((row) =>
        row
          .map((cell) => {
            // 1. Convertimos a string
            let valor = String(cell ?? '');
            // 2. Quitamos etiquetas HTML
            valor = stripHTML(valor);
            // 3. Reemplazamos saltos de línea con un espacio
            valor = valor.replace(/\r?\n/g, ' ');
            // Devolvemos la celda "limpia"
            return valor;
          })
          // Unir celdas con tabulador
          .join('\t')
      )
      // Unir filas con salto de línea
      .join('\n');

    // Copiar al portapapeles
    navigator.clipboard.writeText(textToCopy).catch((err) => {
      console.error('❌ Error al copiar:', err);
    });
  }

  getColumnsForMode(): any[] {
    if (this.mode === 'medias-normas') {
      return [
        { title: 'Letras', field: 'id' },
        { title: 'A', field: 'a' },
      ];
    } else {
      // Por ejemplo, si no es medias-normas, mostramos A y A Norma
      return [
        { title: 'Letras', field: 'id' },
        { title: 'A', field: 'a' },
        { title: 'A Norma', field: 'a-norma' },
      ];
    }
  }

  // Configura las suscripciones para que la tabla de resultados "escuche" cambios en columnas y data.
  setupSubscriptions(): void {
    this.table.on('tableBuilt', () => {
      this.tablaService.columns$.subscribe((columnsFromOriginal) => {
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

  setupAutoScroll(): void {
    // Habilitar el auto-scroll usando los eventos propios de Tabulator:
    let isSelecting = false;
    let scrollInterval: any = null;
    const scrollSpeed = 20; // Puedes ajustar la velocidad

    // Cuando se presiona el botón del mouse sobre una celda, se inicia la selección
    this.table.on('cellMouseDown', (e: UIEvent, cell) => {
      isSelecting = true;
    });

    // Cuando se suelta el botón del mouse, se termina la selección
    this.table.on('cellMouseUp', (e: UIEvent, cell) => {
      isSelecting = false;
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
    });

    // Mientras se mueve el mouse sobre las celdas durante la selección
    this.table.on('cellMouseMove', (e: UIEvent, cell) => {
      if (!isSelecting) return; // Solo actúa si se está seleccionando

      const mouseEvent = e as MouseEvent;
      const tableContainer = this.tableElement.nativeElement.querySelector(
        '.tabulator-tableholder'
      );
      if (!tableContainer) return;

      const rect = tableContainer.getBoundingClientRect();
      const mouseX = mouseEvent.clientX;
      const mouseY = mouseEvent.clientY;

      // Reiniciar cualquier intervalo activo
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }

      // Iniciar un intervalo que, cada 50ms, verifica la posición del mouse y desplaza la tabla
      scrollInterval = setInterval(() => {
        let moved = false;

        // Desplazamiento horizontal: si el mouse está cerca del borde izquierdo o derecho
        if (mouseX < rect.left + 50) {
          tableContainer.scrollLeft -= scrollSpeed;
          moved = true;
        } else if (mouseX > rect.right - 50) {
          tableContainer.scrollLeft += scrollSpeed;
          moved = true;
        }

        // Desplazamiento vertical: si el mouse está cerca del borde superior o inferior
        if (mouseY < rect.top + 50) {
          tableContainer.scrollTop -= scrollSpeed;
          moved = true;
        } else if (mouseY > rect.bottom - 50) {
          tableContainer.scrollTop += scrollSpeed;
          moved = true;
        }

        // Si no se ha movido, detener el intervalo
        if (!moved) {
          clearInterval(scrollInterval);
          scrollInterval = null;
        }
      }, 50);
    });

    // Además, si el mouse sale del contenedor, se cancela el desplazamiento
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
}
