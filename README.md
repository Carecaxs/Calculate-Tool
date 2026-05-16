# Calculate Tool

Aplicación web desarrollada con Angular para realizar cálculos relacionados con medias, porcentajes y normas. El proyecto está organizado con una arquitectura basada en componentes reutilizables y servicios, usando el enfoque standalone de Angular.

## Tecnologías utilizadas

- Angular 18
- TypeScript
- HTML
- CSS
- Angular CLI

## Estructura del proyecto

```bash
src/
└── app/
    ├── pages/
    │   ├── medias/
    │   ├── porcentajes/
    │   └── normas/
    ├── components/
    │   ├── buttons/
    │   ├── tables/
    │   └── navbar/
    ├── services/
    ├── app.config.ts
    ├── app.routes.ts
    └── main.ts
```

## Arquitectura

El proyecto utiliza una estructura separada por responsabilidades:

- `pages/`: contiene las pantallas principales de la aplicación.
- `components/`: contiene componentes reutilizables como botones, tablas y navegación.
- `services/`: contiene la lógica de negocio y el procesamiento de datos.
- `app.routes.ts`: define las rutas principales de la aplicación.
- `app.config.ts`: contiene la configuración global del proyecto.

La aplicación no utiliza `AppModule`, ya que trabaja con el enfoque standalone de Angular.

## Instalación y ejecución

```bash
git clone URL_DEL_REPOSITORIO
cd Calculate-Tool
npm install
ng serve
```

Luego abre el navegador en:

```bash
http://localhost:4200/
```

## Funcionalidades principales

- Cálculo de medias
- Cálculo de porcentajes
- Uso de tablas para mostrar resultados
- Navegación entre secciones
- Separación de lógica mediante servicios

## Autor

Desarrollado por Oscar Vásquez Rivas.
