import { Injectable } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { create, all, forEach } from 'mathjs';

@Injectable({
  providedIn: 'root',
})
export class CalculosService {
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
    this.t_teorico = ds == 95 ? 1.96 : 1.645;
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

    // Filtrar solo las comparaciones completas
    let comparacionesValidas = this.comparacionesSeleccionadas.filter(
      (c) => c.col1 && c.col2
    );

    // Si no hay comparaciones válidas, se crea una comparación virtual
    // que abarque TODAS las columnas (excepto 'id')
    if (comparacionesValidas.length === 0) {
      const allKeys = Object.keys(bases).filter((key) => key !== 'id');
      if (allKeys.length > 0) {
        comparacionesValidas = [
          {
            col1: allKeys[0],
            col2: allKeys[allKeys.length - 1],
            color: 'transparent', // El color no importa aquí
          },
        ];
      }
    }

    // Procesa cada fila usando las comparaciones (virtual o reales)
    const processedData = filteredData.map((row) => {
      if (row.id === 'Base') return { ...row }; // Si es la base, se devuelve tal cual
      return this.processRow(row, bases, comparacionesValidas);
    });

    // 4) Emitir los resultados (filtrando filas vacías)
    const finalResults = processedData.filter((row) => {
      // Siempre se conserva la fila "Base" (si la deseas)
      if (row.id === 'Base') return true;

      // Verificar que al menos un campo (distinto de 'id') tenga contenido
      return Object.keys(row)
        .filter((key) => key !== 'id')
        .some((key) => row[key] && row[key].toString().trim() !== '');
    });
    this.dataSubject.next(finalResults); // Actualiza los datos en el observable
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
          .map((compareColumn) => {
            return this.t_teorico === 1.96
              ? compareColumn.toUpperCase()
              : compareColumn.toLowerCase();
          })
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

    // 3) Si no hay comparaciones válidas (o si la única comparación está incompleta),
    // se realiza el cálculo en TODAS las columnas.
    if (this.comparacionesSeleccionadas.length === 0) {
      const partialResults = this.calcularDiferenciasEnRango(
        allCols,
        baseRow,
        mediaRow,
        desvRow
      );
      allCols.forEach((col) => {
        colResults[col] = partialResults[col];
      });
    } else {
      // 4) Recorre cada comparación => define el rango => valida => si válido, calcula
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
    }

    // 5) Construimos la nueva fila "Media" con los valores resultantes
    const newMediaRow = { ...mediaRow };
    allCols.forEach((col) => {
      newMediaRow[col] = colResults[col];
    });

    // 6) Reemplaza la fila "Media" en data
    const newData = data.map((row) => (row.id === 'Media' ? newMediaRow : row));
    newData.forEach((item, idx) => (data[idx] = item));

    // 7) Actualiza la tabla principal
    this.dataSubject.next(data);

    // 8) Actualiza la tabla de resultados
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
              dsAccumulado.push(
                this.t_teorico === 1.96
                  ? colComparada.toUpperCase()
                  : colComparada.toLowerCase()
              );
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

  /**
   * Calcula la diferencia significativa entre la Media y la Norma para cada columna.
   * - Localiza las filas "Base" (n), "Media", "Desviación" y "Norma".
   * - Para cada columna (ej. "A", "B", etc.):
   *    1) Obtiene n, media, desviación estándar y norma.
   *    2) Calcula z = (Media - Norma) / (sd / sqrt(n)).
   *    3) Si |z| > t_teorico, hay diferencia significativa:
   *       - Muestra flecha verde hacia arriba si Media > Norma.
   *       - Muestra flecha verde hacia abajo si Media < Norma.
   *    4) Si no es significativo o no hay datos suficientes, no se muestra flecha.
   * - Finalmente, emite la fila de resultados en resultadosSubject.
   */

  public ejecutarCalculoMediaNorma(data: any[]) {
    // 1) Buscar filas
    const baseRow = data.find((row) => row.id === 'Base');
    const mediaRow = data.find((row) => row.id === 'Media');
    const desvRow = data.find((row) => {
      const idSinAcentos = row.id
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();
      return idSinAcentos.includes('desviacion');
    });
    const normaRow = data.find((row) => row.id.toLowerCase().includes('norma'));

    if (!baseRow || !mediaRow || !desvRow || !normaRow) {
      console.warn('Faltan filas Base, Media, Desviación o Norma');
      return;
    }

    // 2) Obtener todas las columnas (excepto "id")
    const allCols = Object.keys(baseRow).filter((c) => c !== 'id');

    // 3) Construir un objeto para la fila de resultados
    const resultRow: any = { id: 'Resultado' };

    // 4) Iterar sobre cada columna (a, b, c, etc.)
    allCols.forEach((col) => {
      const n = Number(baseRow[col]);
      const media = Number(mediaRow[col]);
      const sd = Number(desvRow[col]);
      const norma = Number(normaRow[col]);

      // Validar datos
      if (isNaN(n) || isNaN(media) || isNaN(sd) || isNaN(norma)) {
        resultRow[col] = '';
        return;
      }

      // 5) Construir el valor base (ej. "4.36")
      let resultadoStr = media.toFixed(2);

      // 6) Calcular el test z = (Media - Norma) / (sd / sqrt(n))
      if (n > 1 && sd > 0) {
        const diff = media - norma;
        const se = sd / Math.sqrt(n);
        const z = diff / se;
        const isSignificativo = Math.abs(z) > this.t_teorico;

        // 7) Agregar flechas si es significativo
        if (isSignificativo) {
          if (diff > 0) {
            // Flecha verde hacia arriba
            resultadoStr +=
              ' <i class="fas fa-arrow-up" style="color: green;"></i>';
          } else if (diff < 0) {
            // Flecha verde hacia abajo
            resultadoStr +=
              ' <i class="fas fa-arrow-down" style="color: green;"></i>';
          }
          // Si diff === 0, no agregamos nada
        }
      }

      resultRow[col] = resultadoStr;
    });

    // 8) Emitir la fila de resultados
    this.resultadosSubject.next([resultRow]);
  }

  // =========================================================
  //  Lógica "Porcentajes Normas (muestras distintas)"
  // =========================================================
  /*
   * Asume que la fila "Base" contiene la base (n) para cada columna principal (por ejemplo, "a" = 89).
   * Cada fila (1,2,3,...) tiene un valor en la columna principal (porcentaje) y en la columna "a-norma" (norma).
   * Para cada par de columnas (por ejemplo, "a" y "a-norma"), se calcula el estadístico z:
   *   z = (p - p0) / sqrt( p0 * (1 - p0) / n )
   * donde p es el porcentaje de la fila y p0 es la norma (ambos convertidos a decimal).
   * Si |z| es mayor que el valor crítico (t_teorico, p.ej. 1.96 para 95%):
   *   - Se muestra una flecha verde hacia arriba (↑) si p > p0.
   *   - Se muestra una flecha verde hacia abajo (↓) si p < p0.
   * Si la diferencia no es significativa, no se muestra ningún símbolo.
   */

  public ejecutarCalculoPorcentajesNormas(data: any[]) {
    // 1) Localiza la fila "Base" (contiene la base n para cada columna principal)
    const baseRow = data.find((row) => row.id === 'Base');
    if (!baseRow) {
      console.warn('No se encontró la fila "Base".');
      return;
    }

    // 2) Identificar parejas de columnas: ("a","a-norma"), ("b","b-norma"), etc.
    const allKeys = Object.keys(baseRow).filter((k) => k !== 'id');
    const pairs = this.encontrarParejas(allKeys);
    if (pairs.length === 0) {
      console.warn('No se encontraron columnas con "-norma".');
      return;
    }

    // 3) Crear un array de resultados
    const resultados: any[] = [];

    data.forEach((row) => {
      // Copiamos la fila Base tal cual
      if (row.id === 'Base') {
        resultados.push({ ...row });
        return;
      }

      // Para filas normales (1..n)
      const newRow: any = { id: row.id };

      pairs.forEach((pair) => {
        const colPrincipal = pair.col; // ej. "a"
        const colNorma = pair.norma; // ej. "a-norma"

        // Lee la celda principal y la norma como cadenas
        const rawValue = (row[colPrincipal] ?? '').toString().trim();
        const rawNorma = (row[colNorma] ?? '').toString().trim();

        // Si la celda principal está vacía => mostramos en blanco
        if (!rawValue) {
          newRow[colPrincipal] = '';
          newRow[colNorma] = rawNorma ? rawNorma + '%' : '';
          return;
        }

        // Convertir a número
        const valorNum = parseFloat(rawValue);
        if (isNaN(valorNum)) {
          newRow[colPrincipal] = '';
          newRow[colNorma] = rawNorma ? rawNorma + '%' : '';
          return;
        }

        // Mismo procedimiento para la norma
        if (!rawNorma) {
          newRow[colNorma] = '';
        }
        const normaNum = parseFloat(rawNorma);
        if (isNaN(normaNum)) {
          newRow[colNorma] = '';
        }

        // Tomar la base (n) desde la fila Base en la columna principal
        const baseNum = parseFloat(String(baseRow[colPrincipal])) || 0; // ej. 89 => n=89

        // Convertir a decimal
        const p = valorNum / 100;
        const p0 = normaNum / 100;

        // Texto base (ej. "34")
        let resultStr = `${valorNum}`;

        // Test z (se calcula si la base y la norma tienen valores adecuados)
        if (baseNum > 1 && p0 > 0 && p0 < 1) {
          const diff = p - p0;
          const se = Math.sqrt((p0 * (1 - p0)) / baseNum);
          const z = se > 0 ? diff / se : 0;
          const isSignificativo = Math.abs(z) > this.t_teorico; // Ej. 1.96 para 95%

          if (isSignificativo) {
            if (diff > 0) {
              // Diferencia significativa y valor mayor que norma: flecha hacia arriba
              resultStr +=
                ' <i class="fas fa-arrow-up" style="color: green;"></i>';
            } else if (diff < 0) {
              // Diferencia significativa y valor menor que norma: flecha hacia abajo
              resultStr +=
                ' <i class="fas fa-arrow-down" style="color: green;"></i>';
            }
            // Si diff es 0, no se muestra nada
          }
          // Si no es significativo, no se añade ningún símbolo
        }

        newRow[colPrincipal] = resultStr;
        newRow[colNorma] = `${normaNum}`;
      });

      resultados.push(newRow);
    });

    // 4) Emitir los resultados (filtrando filas vacías)
    const finalResults = resultados.filter((row) => {
      if (row.id === 'Base') return true;
      return Object.keys(row)
        .filter((key) => key !== 'id')
        .some((key) => row[key] && row[key].toString().trim() !== '');
    });

    this.resultadosSubject.next(finalResults);
  }

  /**
   * Encuentra parejas (col, col-norma) en allKeys.
   */
  private encontrarParejas(
    allKeys: string[]
  ): { col: string; norma: string }[] {
    const pairs: { col: string; norma: string }[] = [];
    const normas = allKeys.filter((k) => k.endsWith('-norma'));
    normas.forEach((normKey) => {
      const mainKey = normKey.replace('-norma', '');
      if (allKeys.includes(mainKey)) {
        pairs.push({ col: mainKey, norma: normKey });
      }
    });
    return pairs;
  }
}
