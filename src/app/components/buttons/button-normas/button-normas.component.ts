import { Component } from '@angular/core';
import { TablaServiceService } from '../../../services/tabla-service.service';
import { CalculosService } from '../../../services/calculos.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button-normas',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './button-normas.component.html',
  styleUrl: './button-normas.component.css',
})
export class ButtonNormasComponent {
  numeroDeFilas: number = 10; //esta variable se sincroniza con el input de cantidad de filas
  numeroDeColumnas: number = 1; // esta variable se sincroniza con el input de cantidad de columnas
  columnaOptions: number[] = Array.from({ length: 30 }, (_, i) => i + 1); // propiedad que Genera las opciones de columna [2, 3, ..., 30]

  mode: string = '';
  currentColumns: any[] = [];

  constructor(
    private tablaService: TablaServiceService,
    private calculosService: CalculosService
  ) {}

  ngAfterViewInit() {
    this.tablaService.tablaLista$.subscribe((estado) => {
      if (estado) {
        //limpiar las tablas por si tienen datos
        this.limpiarDatos();

        setTimeout(() => {
          this.cargarColumnasActuales();

          this.mode = this.tablaService.getMode(); //obtener si estamos en la seccion de porcentajes con norma o medias con norma
        });
      }
    });
  }

  cargarColumnasActuales() {
    //alamacenar las columnas de la tabla, usamos slice para saltarnos la primera columna que va ser "letras"
    this.currentColumns = this.tablaService
      .getColumnsData()
      .slice(1)
      .map((column) => ({
        field: column.getField(),
        title: column.getDefinition().title,
      }));
  }

  //metodo para actualizar la cantidad de columnas, recibe el nuevo numero de columnas
  actualizarColumnas(numeroDeColumnas: number) {
    this.tablaService.updateColumnCountPorcentajesNormas(
      Number(numeroDeColumnas)
    );
    this.cargarColumnasActuales();
  }

  //funcion que limpia los datos de la tabla
  limpiarDatos() {
    this.tablaService.limpiarDatosTabla();
  }

  //ejecuta el calculo con las comparaciones contenidas
  ejecutarCalculo() {
    //se envia los datos de la tabla original y los elementos de comparacion
    const data = this.tablaService.getTableInstance().getData();

    this.mode === 'medias-normas'
      ? this.calculosService.ejecutarCalculoMediaNorma(data)
      : this.calculosService.ejecutarCalculoPorcentajesNormas(data);

    //aplicar los colores seleccionado a las columnas de las tablas
    //this.tablaService.applyColorsToColumns(3);
  }

  //metodo para evitar que al seleccionar cantidad de filas el usuario ingrese un cero de primero, ya despues de lo permite por ejemplo que quiera poner 10,20,etc...
  evitarCeroInicial(event: KeyboardEvent) {
    if (
      (event.key === '0' &&
        (!this.numeroDeFilas || this.numeroDeFilas.toString().length === 0)) ||
      event.key === '-'
    ) {
      event.preventDefault(); // Bloquea la tecla "0" si es el primer carácter
    }
  }

  //metodo para actualizar la cantidad de filas, recibe el nuevo numero de filas, tiene que ser mayor a 1
  actualizarFilas(numeroDeFilas: number) {
    if (numeroDeFilas > 0) {
      this.tablaService.updateRowCount(numeroDeFilas);
    }
  }
}
