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
  ejecutarCalculo(data: any[]) {
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
}
