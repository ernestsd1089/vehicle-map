# Vehicle Map

A fleet management dashboard built with Angular 21, featuring real-time vehicle tracking on an interactive map.

## Features

- **Reverse geocoding** — Human-readable addresses for vehicle locations, with TTL-based localStorage caching to minimize API calls
- **NgRx state management** — Centralised state using `createFeature` for vehicles and selected vehicle details
- **Responsive layout** — Desktop sidebar + mobile bottom sheet layout using Angular Material
- **Vehicle search** — Filter the vehicle list by make, model, year, or VIN in real time
- **Marker clustering** — Nearby vehicles are combined into a single cluster marker showing the count; clicking zooms in to reveal individual vehicles

## Tech Stack

- Angular 21 + TypeScript
- NgRx (state management)
- Angular Material + Tailwind CSS v4
- Jest + Angular Testing Library (unit tests)
- OpenLayers (map)

## Getting Started

### Development server

```bash
ng serve
```

Open `http://localhost:4200/`. The app reloads automatically on file changes.

The dev server proxies `/api` requests to the upstream data source via `proxy.conf.json`. No additional configuration is needed for local development.

### Production build

```bash
ng build
```

Output is placed in `dist/vehicle-map/browser/`. The production build hits the API directly (configured via `environment.prod.ts`), so no proxy is needed.

To preview the production build locally:

```bash
npx serve dist/vehicle-map/browser
```

Then open `http://localhost:3000`.

> **Windows / PowerShell note:** If you get a script execution policy error, run via Command Prompt (`cmd`) or fix it once with:
>
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
> ```

### Running unit tests

```bash
ng test
```

Uses Jest with `jest-preset-angular` and Angular Testing Library.

## Implementation Notes

### Tailwind + Angular Material

Tailwind utility classes occasionally need `!important` overrides to take precedence over Angular Material's component styles. Where this is done, it is intentional — Angular Material's encapsulated styles have higher specificity by default.

### Caching

Reverse geocoding results are cached in localStorage with a TTL to avoid redundant requests for vehicles that haven't moved significantly.
