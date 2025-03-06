import { Component, ElementRef, ViewChild } from '@angular/core';
import { CalculosService } from '../../../services/calculos.service';
import { TablaServiceService } from '../../../services/tabla-service.service';
import { SpreadsheetModule, Tabulator } from 'tabulator-tables';

@Component({
  selector: 'app-tabla-resultado-media',
  standalone: true,
  imports: [],
  templateUrl: './tabla-resultado-media.component.html',
  styleUrl: './tabla-resultado-media.component.css',
})
export class TablaResultadoMediaComponent {
  @ViewChild('table') tableElement!: ElementRef;
  table!: Tabulator;

  constructor(
    private calculosService: CalculosService,
    private tablaService: TablaServiceService
  ) {}

  ngAfterViewInit(): void {
    Tabulator.registerModule([SpreadsheetModule]);

    this.table = new Tabulator(this.tableElement.nativeElement, {
      data: [], //inserta los datos procesados
      columnDefaults: {
        minWidth: 70,
        resizable: false,
        headerSort: false,
        formatter: 'html',
      },
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
          minWidth: 70,
        },
        {
          title: 'B',
          field: 'b',
          headerSort: false,
          resizable: false,
          formatter: 'html',
          minWidth: 70,
        },
      ],
      rowContextMenu: [
        {
          label: 'Copiar selección',
          action: (e: UIEvent, _row: any) => {
            // Invocar el método nativo para copiar la selección
            (this.table as any).copyToClipboard();
          },
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
      clipboardCopyConfig: {
        rowHeaders: false,
        columnHeaders: false,
      },
      clipboardPasteParser: 'range',
      clipboardPasteAction: undefined,
    });

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

    this.table.on('tableBuilt', () => {
      // Escuchar cambios en las columnas después de que la tabla se construyó
      this.calculosService.columns$.subscribe((columnsFromFirstTable) => {
        if (columnsFromFirstTable.length > 0) {
          const updatedColumns = columnsFromFirstTable.map((col) => ({
            ...col,
            editor: false, // Deshabilitamos la edición en la tabla de comparación
            formatter: 'html',
          }));
          this.table.setColumns(updatedColumns);
        }
        this.tablaService.setTableResultMediaInstance(this.table);
      });

      // Suscribirnos al Observable resultados$
      this.calculosService.resultados$.subscribe((nuevaData) => {
        // Cada vez que haya nuevos resultados, actualizamos la tabla
        this.table.setData(nuevaData);
      });
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
}
