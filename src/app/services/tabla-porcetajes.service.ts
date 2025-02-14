import { Injectable } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import {create,all}from 'mathjs';

@Injectable({
  providedIn: 'root'
})
export class TablaPorcetajesService {

  constructor() { }

  private dataSubject= new BehaviorSubject<any[]>([]);
  private columnsSubject = new BehaviorSubject<any[]>([]);

  data$= this.dataSubject.asObservable();
  columns$ = this.columnsSubject.asObservable();


  setData(data: any[]) {
    const filteredData = data;
    const bases=data.find(fila => fila.id==="Base");
  
    const processedData = filteredData.map((row) => { //row representa cada fila u objeto de el array o tabla, al final retorna la fila procesada(row) y lo guarda en el nuevo array filteredData con el map
      const columns = Object.keys(row); // Obtenemos todas las claves de las columnas dinámicamente(id,a,b,c...)
      let processedRow = { ...row };//se crea una copia y no una referencia con {...row}

      
      // Ignoramos la fila "Base" durante los cálculos
      if (row.id === 'Base') {

        return processedRow; // Solo devuelve la fila sin modificarla
      }

      
  
      columns.forEach((column, index) => { // field de la columna y el indice
        if (index === 0 || column === 'id') return; // Ignoramos la columna "id" y ahora también columna "Letras"
  
        

        const currentValue = row[column]; //obtenemos el valor de la celda actual en la fila actual

     
        // Ignorar si la celda actual está vacía
        if (currentValue === undefined || currentValue === null || currentValue === '') {
          return;
        }

  
        // Acumula las letras de las columnas menores
        const greaterThanColumns = columns
          .filter((compareColumn) => compareColumn !== column && compareColumn !== 'id') // Excluir la columna actual  y "id", esto hace que se ejecute solo si se cumple la condicion
          .filter((compareColumn) => {

            const compareValue = row[compareColumn]; // extrae el valor actual de la celda que se esta verificando
            
            //extraer las bases a comparar
            const b1=Number(bases[column]);
            const b2=Number(bases[compareColumn]);

            //calcular ponderada
            const p1=currentValue/100;
            const p2=compareValue/100;
            const ponderada=(p1*b1 + p2*b2)/(b1+b2);


            //calcular Z
            const z= Math.abs((p1-p2)/ Math.sqrt(ponderada*(1-ponderada) * (1/b1 + 1/b2)));

            // Comparar con t teórico (95% de confianza) 
            const t_teorico = 1.96; // Valor para 95%

           


            console.log(`${index} estas son las bases a comparar ===== b1= ${b1} , b2= ${b2} =  esta es p1 ${p1} y esta p2 ${p2}`);
            console.log(p1*b1 + p2*b2);
            console.log(b1 + b2);
            console.log(`ahora la ponderada es ${ponderada}`);
            console.log(`Z es ${z}`);
            console.log(`y el currenValue es  ${currentValue}  y el compare value es ${compareValue}`);
            console.log(`------------------fin del calculo-------------------`);
            
            //console.log(compareValue);            EN ESTA PARTE ES DONDE ESTA EL ERROR
            return (//si se cumplen las condiciones del return se mantiene el array filtrado, sino se excluye
              compareValue !== undefined &&
              compareValue !== null &&
              compareValue !== '' &&
              z>t_teorico &&
              Number(currentValue) > Number(compareValue)//si valor actual en la columna es mayor que el valor a comparar
              
            );
          })
          .map((compareColumn) => compareColumn.toUpperCase()) // Convertir los nombres de columna a mayúscula
          .join(', '); // Separar las letras con comas
  
        // Si hay columnas menores, añadirlas al valor actual
        if (greaterThanColumns) {//el array tiene datos menores
          processedRow[column] = `${currentValue} (${greaterThanColumns})`; //se concatenan los valores ejemplo 10(A,B) justamente en la fila y columna actual
        } else {
          processedRow[column] = `${currentValue}`; // Mantener solo el valor si no hay menores
        }
      });//fin del forEach que recorre cada columna por su field(a,b,c, etc...)
  
      return processedRow; //devuelve la fila procesada ya con sus letras
    });
  
    processedData.forEach((row, index) => {
      console.log(`Fila ${index + 1}:`, row);
    });
    
    this.dataSubject.next(processedData); // Actualiza o emite los datos procesados en el array processedData luego con el cellEdited en tablaComponent se llama a setData, este se ejecuta y muestra el nuevo array 
  }
  
  


  setColumns(columns: any[]) {
    this.columnsSubject.next(columns);
  }

  

  

}
