# Calculate Tool

Web application developed with Angular for calculations related to averages, percentages, and standards. The project follows a component and service-based architecture using Angular standalone configuration.

## Technologies Used

- Angular 18
- TypeScript
- HTML
- CSS
- Angular CLI

## Project Structure

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

## Architecture

The project uses a responsibility-based structure:

- `pages/`: contains the main application views.
- `components/`: reusable UI components such as buttons, tables, and navbar.
- `services/`: handles business logic and data processing.
- `app.routes.ts`: defines the application's routing system.
- `app.config.ts`: contains the global application configuration.

The application does not use `AppModule`, since it follows Angular's standalone architecture approach.

## Installation and Setup

```bash
git clone YOUR_REPOSITORY_URL
cd Calculate-Tool
npm install
ng serve
```

Then open the browser at:

```bash
http://localhost:4200/
```

## Main Features

- Average calculations
- Percentage calculations
- Result tables
- Navigation between sections
- Separation of concerns using services

## Author

Developed by Oscar Vásquez Rivas.
