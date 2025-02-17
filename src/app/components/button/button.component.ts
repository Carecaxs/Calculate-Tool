import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 🔹 Importar FormsModule
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';  // Importamos Subscription

import { TablaServiceService } from '../../services/tabla-service.service'; // 🔹 Importar FormsModule

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [FormsModule, CommonModule],//necesario para usar la sincronizacion entre inputs y variables del componente
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {

  numeroDeFilas: number = 0;//esta variable se sincroniza con el input de cantidad de filas
  numeroDeColumnas: number = 0; // esta variable se sincroniza con el input de cantidad de columnas
  numeroDeComparaciones: number = 1; // esta variable se sincroniza con el input de cantidad de comparaciones
  diferenciaSeleccionada: number=95;// esta variable se sincroniza con el input de diferencia significativa
  firstColumnSelected : string="a"; // esta variable se sincroniza con el input de la primera columna seleccionada
  secondColumnSelected : string="b";// esta variable se sincroniza con el input de la segunda columna seleccionada
  currentColumns: any[]=[];



  constructor(private tablaService: TablaServiceService) { } // Inyectamos el servicio en el constructor

 

  ngAfterViewInit() {
    setTimeout(() => {
      // esperar 2 segundos para cargar las columnas disponibles
      this.cargarColumnasActuales();
    }, 2000); // 2000 milisegundos = 2 segundos
  }
  



  cargarColumnasActuales(){
    //alamacenar las columnas de la tabla, usamos slice para saltarnos la primera columna que va ser "letras"
    this.currentColumns=this.tablaService.getColumnsData().slice(1).map(column => ({
      field: column.getField(),
      title: column.getDefinition().title
    }));


  }


  actualizarFilas(numeroDeFilas: number) {
    this.tablaService.updateRowCount(numeroDeFilas); 
 

  }

  modificarComparaciones() {
  
  }

  limpiarDatos() {

  }

    // Función para manejar el cambio de cantidad de comparaciones
    onComparacionesChange() {
 

    }


    //funcion para manejar cambio de diferencia significativa
    onDiferenciaChange() {

      console.log(this.diferenciaSeleccionada);
  
    }

}
