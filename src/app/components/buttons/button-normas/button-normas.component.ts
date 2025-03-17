import { Component } from '@angular/core';

import { CalculosService } from '../../../services/calculos.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TablaService } from '../../../services/tabla.service';

/**
 * Componente para manejar la sección de Normas en la aplicación.
 * Permite configurar filas y columnas de la tabla, ejecutar cálculos
 * y limpiar los datos.
 */

@Component({
  selector: 'app-button-normas',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './button-normas.component.html',
  styleUrl: './button-normas.component.css',
})
export class ButtonNormasComponent {
  /**
   * Cantidad de filas, se sincroniza con el input correspondiente.
   * Valor por defecto: 10.
   */
  numeroDeFilas: number = 10;

  /**
   * Cantidad de columnas, se sincroniza con el select correspondiente.
   */
  numeroDeColumnas!: number;

  /**
   * Opciones disponibles para la cantidad de columnas.
   */
  columnaOptions: number[] = [];

  /**
   * Modo actual de la sección: puede ser 'porcentajes-normas' o 'medias-normas'.
   */
  mode: string = '';

  /**
   * Columnas actuales de la tabla (excluyendo la primera columna "letras").
   */
  currentColumns: any[] = [];

  diferenciaSeleccionada: number = 95; // esta variable se sincroniza con el input de diferencia significativa

  constructor(
    private tablaService: TablaService,
    private calculosService: CalculosService
  ) {}

  /**
   * Hook que se ejecuta después de inicializar la vista.
   * Suscribe a los cambios en la tabla y ajusta la configuración
   * inicial (limpiar datos, establecer opciones de columnas, etc.).
   */

  ngAfterViewInit() {
    this.tablaService.tablaLista$.subscribe((estado) => {
      if (estado) {
        // Limpiar la tabla por si tiene datos previos
        this.limpiarDatos();

        setTimeout(() => {
          // Obtener el modo actual (porcentajes-normas o medias-normas)
          this.mode = this.tablaService.getMode();

          // Definir las opciones de columnas según el modo (5 para porcentaje contra norma - 10 para media contra norma)
          if (this.mode === 'porcentajes-normas') {
            this.columnaOptions = Array.from({ length: 5 }, (_, i) => i + 1);
          } else {
            this.columnaOptions = Array.from({ length: 10 }, (_, i) => i + 1);
          }

          // Por defecto, se selecciona la opción 1 en el select
          this.numeroDeColumnas = 1;

          // Cargar las columnas actuales de la tabla
          this.cargarColumnasActuales();
        });
      }
    });
  }

  /**
   * Carga la información de las columnas actuales de la tabla,
   * omitiendo la primera columna (generalmente "letras").
   */
  cargarColumnasActuales() {
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
    if (this.mode === 'porcentajes-normas') {
      this.tablaService.updateColumnCountPorcentajesNormas(
        Number(numeroDeColumnas)
      );
    } else {
      // Sumamos 1 si consideramos la columna "letras" como fija
      this.tablaService.updateColumnCount(Number(numeroDeColumnas) + 1);
    }

    this.cargarColumnasActuales();
  }

  /**
   * Limpia los datos de la tabla, dejándola vacía.
   */
  limpiarDatos() {
    this.tablaService.limpiarDatosTabla();
  }

  /**
   * Ejecuta el cálculo correspondiente (media o porcentajes)
   * según el modo seleccionado.
   */
  ejecutarCalculo() {
    //enviar la ds seleccionada la servicio
    this.enviarDS();
    //se envia los datos de la tabla original y los elementos de comparacion
    const data = this.tablaService.getTableInstance().getData();

    if (this.mode === 'medias-normas') {
      this.calculosService.ejecutarCalculoMediaNorma(data);
    } else {
      this.calculosService.ejecutarCalculoPorcentajesNormas(data);
    }
  }

  /**
   * Evita que se ingrese '0' o '-' como primer carácter en el input
   * de la cantidad de filas.
   */
  evitarCeroInicial(event: KeyboardEvent) {
    if (
      (event.key === '0' &&
        (!this.numeroDeFilas || this.numeroDeFilas.toString().length === 0)) ||
      event.key === '-'
    ) {
      // Bloquea la tecla "0" si es el primer carácter
      event.preventDefault();
    }
  }

  /**
   * Actualiza la cantidad de filas de la tabla si el valor ingresado
   * es mayor que 0.
   * numeroDeFilas Nueva cantidad de filas.
   */
  actualizarFilas(numeroDeFilas: number) {
    if (numeroDeFilas > 0) {
      this.tablaService.updateRowCount(numeroDeFilas);
    }
  }

  //funcion para enviar la diferencia significativa al servicio
  enviarDS() {
    this.calculosService.setDiferenciaSifnificativa(
      this.diferenciaSeleccionada
    );
  }
}
