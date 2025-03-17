# 📌 Calculate Tool - Arquitectura

La aplicación está desarrollada en **Angular**, siguiendo una arquitectura basada en **componentes y servicios**, con una estructura organizada en carpetas para facilitar la **escalabilidad y mantenimiento**.

---

## 🏗️ 1. Estructura General

### **📌 Componentes (Capa de Presentación)**

Los componentes están organizados en carpetas según su función:

src/
│── app/
│ ├── pages/ # Pantallas principales
│ │ ├── medias/ # Contiene los componentes relacionados con la sección de medias
│ │ ├── porcentajes/ # Contiene los componentes de la sección de porcentajes
│ │ ├── normas/ # Agrupa los componentes relacionados con normas
│ │ │
├── components/ # Componentes reutilizables
| ├── buttons/ # Botones específicos (button-porcentajes, button-medias, button-normas)
| ├── tables/ # Incluye la tabla principal y las tablas de resultados
| │── navbar/ # Contiene el componente de navegación
│ │── services/ # Lógica de negocio y procesamiento de datos
│ ├── app.config.ts # Configuración global
│ ├── app.routes.ts # Definición de rutas
│ ├── main.ts # Punto de arranque de la aplicación

✅ **Estos servicios se inyectan en los componentes que los requieren**, promoviendo la **separación de responsabilidades**.

---

## 🌍 3. Configuración Global y Enrutamiento

La aplicación **NO usa un `AppModule`**, sino que emplea un enfoque **stand-alone** con `app.config.ts`.

📌 **Archivos principales de configuración:**

- **`app.config.ts`**

  - Contiene la configuración global de la aplicación.
  - Define los `providers` y la configuración del enrutamiento con `provideRouter(routes)`.

- **`app.routes.ts`**

  - Define la navegación de la aplicación mediante **rutas** que cargan los componentes dentro de `pages/`.

- **`main.ts`**
  - Inicia la aplicación con:
    ```ts
    bootstrapApplication(AppComponent, appConfig);
    ```
  - Se elimina el enfoque tradicional basado en módulos.

---

## 📌 Resumen

✅ **Cada página en `pages/`** actúa como una pantalla principal donde se organizan los componentes relacionados.  
✅ **Los componentes reutilizables** están en `components/` (botones, tablas, navbar).  
✅ **Los servicios encapsulan la lógica de negocio** y la manipulación de datos, favoreciendo la **reutilización y separación de responsabilidades**.  
✅ **El enrutamiento y la configuración global** se manejan en `app.config.ts`, sin necesidad de un módulo raíz (`AppModule`).

---

## 🚀 Instalación y Ejecución

### 1️⃣ **Instalar Node.js y NPM**

Si no los tienes instalados, descárgalos desde [nodejs.org](https://nodejs.org/).  
Verifica la instalación ejecutando:

```bash
node -v
npm -v



## Instalar dependencias: npm install
## Levantar el servidor de desarrollo: ng serve





# Proyecto

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.11.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
```
