import { Injectable } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { create, all, forEach } from 'mathjs';

@Injectable({
  providedIn: 'root',
})
export class TablaPorcetajesService {
  // Subject para almacenar y emitir datos de la tabla
  private dataSubject = new BehaviorSubject<any[]>([]);

  // Subject para almacenar y emitir las columnas de la tabla
  private columnsSubject = new BehaviorSubject<any[]>([]);

  // Valor teórico para determinar diferencia significativa (por defecto 1.96 para 95%)
  private t_teorico: number = 1.96;

  // Almacena las columnas seleccionadas para comparación y el color
  private comparacionesSeleccionadas: {
    col1: string;
    col2: string;
    color: string;
  }[] = [];

  // Observable para que otros componentes puedan suscribirse a los datos
  data$ = this.dataSubject.asObservable();

  // Observable para las columnas de la tabla
  columns$ = this.columnsSubject.asObservable();

  // 1) BehaviorSubject que guardará la "tabla de resultados de las medias" //nuevo
  private resultadosSubject = new BehaviorSubject<any[]>([]);

  // 2) Observable para que otros componentes (tabla de resultados de las medias) puedan suscribirse //nuevo
  resultados$ = this.resultadosSubject.asObservable();

  // Método para establecer la diferencia significativa (t_teorico)
  setDiferenciaSifnificativa(ds: number) {
    //aca se recibe 90 o 95, en base a ello seleccionamos 1.96 para el 95% o 1.645 para el 90%
    this.t_teorico = ds === 95 ? 1.96 : 1.645;
  }

  //metodo para retornar las comparaciones validas actuales
  getComparaciones() {
    return this.comparacionesSeleccionadas;
  }

  // Método para establecer las comparaciones seleccionadas, adiconal se asigna en col1 la columna menor y en col2 la mayor
  //esto por la logica al set los colores de las columnas
  setComparaciones(
    comparacionesValidas: { col1: string; col2: string; color: string }[]
  ) {
    this.comparacionesSeleccionadas = comparacionesValidas.map(
      (comparacion) => {
        const [colMayor, colMenor] =
          comparacion.col1 > comparacion.col2
            ? [comparacion.col2, comparacion.col1]
            : [comparacion.col1, comparacion.col2];

        return {
          col1: colMayor,
          col2: colMenor,
          color: comparacion.color,
        };
      }
    );
  }

  resetComparaciones() {
    this.comparacionesSeleccionadas = []; // Vaciar las comparaciones almacenadas
  }

  setData(data: any[]) {
    // Crear una copia de los datos originales
    const copiedData = [...data];

    // Reflejar los datos en la otra tabla sin procesarlos
    this.dataSubject.next(copiedData);
  }

  // Método para actualizar los datos de la tabla y procesarlos
  ejecutarCalculoPorcentaje(data: any[]) {
    const filteredData = [...data]; // Crea una copia de los datos originales
    const bases = data.find((fila) => fila.id === 'Base'); // Obtiene la fila base

    // Procesa cada fila llamando a `processRow`
    const processedData = filteredData.map((row) => {
      if (row.id === 'Base') return { ...row }; // Si es la base, se devuelve tal cual
      return this.processRow(row, bases, this.comparacionesSeleccionadas);
    });

    this.dataSubject.next(processedData); // Actualiza los datos en el observable
  }

  // Método para procesar cada fila y calcular diferencias significativas
  private processRow(
    row: any,
    bases: any,
    comparaciones: { col1: string; col2: string; color: string }[]
  ) {
    let processedRow = { ...row }; // Crea una copia de la fila actual
    const columns = Object.keys(row);

    // Procesa cada columna (excepto 'id')
    columns.forEach((column, index) => {
      if (index === 0 || column === 'id') return; // Omite la columna 'id'

      const currentValue = row[column];
      if (
        currentValue === undefined ||
        currentValue === null ||
        currentValue === ''
      ) {
        return;
      }

      // Variable para acumular las diferencias significativas encontradas
      let dsAccumulado: string[] = [];

      comparaciones.forEach((comparacion) => {
        // Determinar el rango de columnas según la comparación actual
        const startIndex = columns.indexOf(comparacion.col1);
        const endIndex = columns.indexOf(comparacion.col2);
        if (startIndex === -1 || endIndex === -1 || startIndex > endIndex)
          return;

        const rangeColumns = columns.slice(startIndex, endIndex + 1);

        // Solo procesar si la columna actual está dentro del rango
        if (!rangeColumns.includes(column)) return;

        // Para la columna actual, compara con las demás del rango
        const ds = rangeColumns
          .filter(
            (compareColumn) =>
              compareColumn !== column && compareColumn !== 'id'
          )
          .filter((compareColumn) => {
            const compareValue = row[compareColumn];
            if (
              compareValue === undefined ||
              compareValue === null ||
              compareValue === ''
            ) {
              return false;
            }
            // Valores base para cada columna
            const b1 = Number(bases[column]);
            const b2 = Number(bases[compareColumn]);

            // Probabilidades (asumiendo que los valores son porcentajes)
            const p1 = currentValue / 100;
            const p2 = compareValue / 100;

            // Cálculo ponderado
            const ponderada = (p1 * b1 + p2 * b2) / (b1 + b2);

            // Estadística Z
            const z = Math.abs(
              (p1 - p2) /
                Math.sqrt(ponderada * (1 - ponderada) * (1 / b1 + 1 / b2))
            );

            // Se acepta la comparación si se supera el umbral y currentValue es mayor
            return (
              z > this.t_teorico && Number(currentValue) > Number(compareValue)
            );
          })
          .map((compareColumn) => compareColumn.toUpperCase())
          .join(', ');

        // Si se encontró alguna diferencia, se acumula
        if (ds) {
          dsAccumulado.push(ds);
        }
      });

      // Actualiza la celda con el valor original y, si existen, las diferencias acumuladas.
      processedRow[column] =
        dsAccumulado.length > 0
          ? `${currentValue} (<strong>${dsAccumulado.join(' | ')}</strong>)`
          : `${currentValue}`;
    });

    return processedRow;
  }

  // Método para actualizar la lista de columnas en la tabla
  setColumns(columns: any[]) {
    this.columnsSubject.next(columns);
  }

  // Método para obtener el color de una columna
  getColorForComparation(column: string): string {
    // Si la columna es "id", "Base", etc., no colorear
    if (column === 'id' || column === 'Base') {
      return 'transparent';
    }

    const comparacion = this.comparacionesSeleccionadas.find(
      (comp) => column >= comp.col1 && column <= comp.col2
    );
    return comparacion ? comparacion.color : 'transparent'; // Si no hay color, retorna 'transparent'
  }

  // ===================================
  // MÉTODO PRINCIPAL: Calcular Medias
  // ===================================
  /**
   * 1) Busca filas Base, Media, Desviación
   * 2) Inicializa todas las columnas en blanco
   * 3) Para cada comparación:
   *    - Si el rango está completo => calcula diferencias
   *    - Si no => deja en blanco
   * 4) Reemplaza la fila "Media" en la data
   * 5) Actualiza la tabla principal y la tabla de resultados
   */
  ejecutarCalculoMedias(data: any[]) {
    const baseRow = data.find((row) => row.id === 'Base');
    const mediaRow = data.find((row) => row.id === 'Media');
    const desvRow = data.find((row) => {
      // Quitar acentos si tu "Desviación" tiene tildes
      const idSinAcentos = row.id
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();
      return idSinAcentos.includes('desviacion');
    });

    if (!baseRow || !mediaRow || !desvRow) {
      console.warn('No se encontraron filas Base, Media o Desviacion');
      return;
    }

    // 1) Obtén todas las columnas (ej. A, B, C, D, F...) excepto "id"
    const allCols = Object.keys(mediaRow).filter((c) => c !== 'id');

    // 2) Crea un objeto con todas las columnas en blanco
    const colResults: Record<string, string> = {};
    allCols.forEach((col) => {
      colResults[col] = '';
    });

    // 3) Recorre cada comparación => define el rango => valida => si válido, calcula
    this.comparacionesSeleccionadas.forEach((comparacion) => {
      const idx1 = allCols.indexOf(comparacion.col1);
      const idx2 = allCols.indexOf(comparacion.col2);
      if (idx1 === -1 || idx2 === -1) {
        // Si la columna no existe, se omite
        return;
      }
      const start = Math.min(idx1, idx2);
      const end = Math.max(idx1, idx2);
      const rangeCols = allCols.slice(start, end + 1);

      // Validamos si TODO el rango está completo (Base, Media, Desviación)
      const rangoValido = this.isRangeComplete(
        rangeCols,
        baseRow,
        mediaRow,
        desvRow
      );
      if (!rangoValido) {
        // Si NO es válido => se quedan en blanco (colResults ya está en blanco)
        return;
      }

      // Si es válido => calculamos diferencias
      const partialResults = this.calcularDiferenciasEnRango(
        rangeCols,
        baseRow,
        mediaRow,
        desvRow
      );

      // Fusionamos partialResults en colResults
      rangeCols.forEach((col) => {
        colResults[col] = partialResults[col];
      });
    });

    // 4) Construimos la nueva fila "Media" con los valores resultantes
    const newMediaRow = { ...mediaRow };
    allCols.forEach((col) => {
      newMediaRow[col] = colResults[col];
    });

    // 5) Reemplaza la fila "Media" en data
    const newData = data.map((row) => (row.id === 'Media' ? newMediaRow : row));
    newData.forEach((item, idx) => (data[idx] = item));

    // 6) Actualiza la tabla principal
    this.dataSubject.next(data);

    // 7) Actualiza la tabla de resultados
    this.actualizarTablaResultadosMedias(data);
  }

  // ===================================
  //  Validar si el rango está completo
  // ===================================
  /**
   * Verifica que en TODAS las columnas del rango existan valores
   * en Base, Media, Desviación (no sean null, undefined, ni string vacío).
   * Si falta algún dato, retorna false => se anula la comparación.
   */
  isRangeComplete(
    rangeCols: string[],
    baseRow: any,
    mediaRow: any,
    desvRow: any
  ): boolean {
    for (const col of rangeCols) {
      if (!this.esValorValido(baseRow[col])) return false;
      if (!this.esValorValido(mediaRow[col])) return false;
      if (!this.esValorValido(desvRow[col])) return false;
    }
    return true;
  }

  private esValorValido(valor: any): boolean {
    if (valor === null || valor === undefined) return false;
    if (typeof valor === 'string' && valor.trim() === '') return false;
    // Si quieres validar que sea numérico:
    // if (isNaN(Number(valor))) return false;
    return true;
  }

  // ===================================
  // Calcular diferencias en un rango
  // ===================================
  /**
   * Devuelve un objeto { A: "4.5 (B)", B: "0.0", ... } con las
   * diferencias significativas calculadas, redondeos, etc.
   */
  calcularDiferenciasEnRango(
    rangeCols: string[],
    baseRow: any,
    mediaRow: any,
    desvRow: any
  ): Record<string, string> {
    const results: Record<string, string> = {};

    rangeCols.forEach((colActual) => {
      const valorNum = parseFloat(String(mediaRow[colActual])) || 0;
      const valorRedondeado = valorNum.toFixed(1);

      // Acumular letras de columnas con las que hay DS
      let dsAccumulado: string[] = [];

      // Comparamos colActual con las demás columnas del rango
      rangeCols
        .filter((c) => c !== colActual)
        .forEach((colComparada) => {
          const n1 = parseFloat(String(baseRow[colActual])) || 0;
          const n2 = parseFloat(String(baseRow[colComparada])) || 0;
          const sd1 = parseFloat(String(desvRow[colActual])) || 0;
          const sd2 = parseFloat(String(desvRow[colComparada])) || 0;

          const media1 = parseFloat(String(mediaRow[colActual])) || 0;
          const media2 = parseFloat(String(mediaRow[colComparada])) || 0;

          const diff = media1 - media2;
          const se = Math.sqrt((sd1 * sd1) / n1 + (sd2 * sd2) / n2);
          if (se > 0) {
            const z = Math.abs(diff / se);
            if (z > this.t_teorico && diff > 0) {
              dsAccumulado.push(colComparada.toUpperCase());
            }
          }
        });

      if (dsAccumulado.length > 0) {
        results[colActual] = `${valorRedondeado} (<strong>${dsAccumulado.join(
          ' | '
        )}</strong>)`;
      } else {
        results[colActual] = valorRedondeado;
      }
    });

    return results;
  }

  // ===================================
  // Actualizar la tabla de resultados
  // ===================================
  actualizarTablaResultadosMedias(data: any[]) {
    const nuevaFila = this.generarFilaResultados(data);
    this.resultadosSubject.next(nuevaFila);
  }

  generarFilaResultados(data: any[]): any[] {
    const mediaRow = data.find((row) => row.id === 'Media');
    if (!mediaRow) return [];
    const resultRow: any = { id: 'Resultado' };
    Object.keys(mediaRow).forEach((col) => {
      if (col !== 'id') {
        resultRow[col] = mediaRow[col];
      }
    });
    return [resultRow];
  }

  // // ============================================
  // // MÉTODO PRINCIPAL: Calcular medias + diferencias
  // // ============================================
  // /**
  //  * 1) Ubica filas Base, Media, Desviación
  //  * 2) Redondea a 1 decimal la fila "Media"
  //  * 3) Calcula diferencias significativas y añade etiquetas (ej.: "(A)")
  //  * 4) Actualiza la tabla principal
  //  * 5) Genera la fila "Resultado" para la segunda tabla
  //  */

  // public ejecutarCalculoMedias(data: any[]) {
  //   //  Busca filas
  //   const baseRow = data.find((row) => row.id === 'Base');
  //   const mediaRow = data.find((row) => row.id === 'Media');
  //   const desvRow = data.find((fila) => {
  //     const idSinAcentos = fila.id
  //       .normalize('NFD')
  //       .replace(/\p{Diacritic}/gu, '') // elimina tildes
  //       .toLowerCase();
  //     return idSinAcentos.includes('desviacion');
  //   });

  //   // Verifica que existan
  //   if (!baseRow || !mediaRow || !desvRow) {
  //     console.warn('No se encontraron filas Base, Media o Desviación');
  //     return;
  //   }

  //   // 2) Crea una copia de la fila "Media" para procesarla
  //   const processedMediaRow = { ...mediaRow };

  //   // 3) Recorre cada columna (A, B, C...) y:
  //   //    - Redondea a 1 decimal
  //   //    - Calcula si hay diferencias con otras columnas del rango
  //   const columns = Object.keys(mediaRow).filter((c) => c !== 'id');

  //   columns.forEach((colActual) => {
  //     // 1) Verificar si esta columna está dentro de algún rango (comparacion.col1..col2)
  //     const isInRange = this.columnaEstaEnAlgunaComparacion(colActual, columns);

  //     // 2) Si NO está en rango, la dejamos en blanco
  //     if (!isInRange) {
  //       processedMediaRow[colActual] = '';
  //       return;
  //     }

  //     // 3) De lo contrario, aquí haces tu cálculo habitual:
  //     //    - Redondear
  //     //    - Calcular diferencias significativas
  //     //    - Añadir etiquetas "(A)" si aplica
  //     // Ejemplo básico (redondeo a 1 decimal):
  //     const valorNum = parseFloat(String(mediaRow[colActual])) || 0;
  //     const valorRedondeado = valorNum.toFixed(1);

  //     // Acumular letras de columnas con las que hay DS
  //     let dsAccumulado: string[] = [];

  //     // Recorremos cada "comparación" (definida por col1 y col2 => rango)
  //     this.comparacionesSeleccionadas.forEach((comparacion) => {
  //       // Determina el rango de columnas
  //       const idxCol1 = columns.indexOf(comparacion.col1);
  //       const idxCol2 = columns.indexOf(comparacion.col2);
  //       if (idxCol1 === -1 || idxCol2 === -1) return;

  //       const start = Math.min(idxCol1, idxCol2);
  //       const end = Math.max(idxCol1, idxCol2);
  //       const rangeCols = columns.slice(start, end + 1);

  //       // Solo comparamos si la columna actual está en ese rango
  //       if (!rangeCols.includes(colActual)) return;

  //       // Comparamos colActual con las demás columnas del rango
  //       rangeCols
  //         .filter((c) => c !== colActual)
  //         .forEach((colComparada) => {
  //           // Toma n, sd y media
  //           const n1 = parseFloat(baseRow[colActual]) || 0;
  //           const n2 = parseFloat(baseRow[colComparada]) || 0;
  //           const sd1 = parseFloat(desvRow[colActual]) || 0;
  //           const sd2 = parseFloat(desvRow[colComparada]) || 0;

  //           const media1 = parseFloat(String(mediaRow[colActual])) || 0;
  //           const media2 = parseFloat(String(mediaRow[colComparada])) || 0;

  //           // Diferencia
  //           const diff = media1 - media2;

  //           // Error estándar
  //           const se = Math.sqrt((sd1 * sd1) / n1 + (sd2 * sd2) / n2);

  //           // Estadístico z/t (simplificado)
  //           if (se > 0) {
  //             const z = Math.abs(diff / se);
  //             // Si z > t_teorico y diff > 0 => colActual > colComparada
  //             if (z > this.t_teorico && diff > 0) {
  //               // Agregamos la letra (o título) de la columna comparada
  //               dsAccumulado.push(colComparada.toUpperCase());
  //             }
  //           }
  //         });
  //     });

  //     // 4) Construir el valor final (ej. "4.5 (A | B)")
  //     if (dsAccumulado.length > 0) {
  //       processedMediaRow[
  //         colActual
  //       ] = `${valorRedondeado} (<strong>${dsAccumulado.join(' | ')}</strong>)`;
  //     } else {
  //       processedMediaRow[colActual] = valorRedondeado;
  //     }
  //   });

  //   // 5) Reemplaza la fila "Media" en data con la versión procesada
  //   const newData = data.map((row) =>
  //     row.id === 'Media' ? processedMediaRow : row
  //   );
  //   // Mutamos el array original
  //   newData.forEach((item, idx) => (data[idx] = item));

  //   // 6) Actualiza la tabla principal
  //   this.dataSubject.next(data);

  //   // 7) Actualiza la tabla de resultados (fila "Resultado")
  //   this.actualizarTablaResultadosMedias(data);
  // }

  // // ===========================================
  // //  Actualizar la tabla de resultados
  // // ===========================================
  // private actualizarTablaResultadosMedias(data: any[]) {
  //   const nuevaFila = this.generarFilaResultados(data);
  //   this.resultadosSubject.next(nuevaFila);
  // }

  // /**
  //  * Construye un array con una sola fila "Resultado" a partir de la fila "Media".
  //  * Esto es lo que se mostrará en la segunda tabla.
  //  */
  // generarFilaResultados(data: any[]): any[] {
  //   const mediaRow = data.find((row) => row.id === 'Media');
  //   if (!mediaRow) {
  //     return [];
  //   }

  //   const resultRow: any = { id: 'Resultado' };
  //   Object.keys(mediaRow).forEach((col) => {
  //     if (col !== 'id') {
  //       resultRow[col] = mediaRow[col];
  //     }
  //   });

  //   return [resultRow];
  // }

  // /**
  //  * Función auxiliar que verifica si `colActual` está en alguno de los rangos
  //  * definidos por col1..col2 en this.comparacionesSeleccionadas
  //  */
  // columnaEstaEnAlgunaComparacion(
  //   colActual: string,
  //   allColumns: string[]
  // ): boolean {
  //   return this.comparacionesSeleccionadas.some((comparacion) => {
  //     const idx1 = allColumns.indexOf(comparacion.col1);
  //     const idx2 = allColumns.indexOf(comparacion.col2);
  //     if (idx1 === -1 || idx2 === -1) return false;

  //     const start = Math.min(idx1, idx2);
  //     const end = Math.max(idx1, idx2);
  //     const rangoCols = allColumns.slice(start, end + 1);

  //     return rangoCols.includes(colActual);
  //   });
  // }
}
