# Gemini Code Assistant Context

This document provides context for the Gemini code assistant to understand the js-bonsai project.

## Project Overview

js-bonsai is a web application that generates procedural ASCII art bonsai trees. It is a port of the command-line tool `cbonsai` to JavaScript and React.

The application allows users to customize the generated trees by adjusting parameters such as size, density, and color. It also supports live animations and an "autoplay" mode for continuous generation with automatic animation.

### Key Technologies

*   **React:** The application is built using React for the user interface.
*   **Vite:** The project uses Vite for fast development and bundling.
*   **Tailwind CSS:** Used for styling the application.
*   **pnpm:** The project uses pnpm for package management.

### Architecture

The core logic for generating the bonsai trees is contained in the `src/lib` directory, which is a vanilla JavaScript implementation of the bonsai generation algorithm. The React components in `src/components` use this library to render the trees and provide controls for customization.

The main application component is `src/App.jsx`, which brings together the different components and manages the application state.

## Building and Running

### Installation

To install the project dependencies, use pnpm:

```bash
pnpm install
```

### Development

To run the application in development mode with hot module replacement, use the following command:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To build the application for production, use the following command:

```bash
pnpm build
```

This will create a `dist` directory with the optimized and bundled application.

### Linting

To run the linter, use the following command:

```bash
pnpm lint
```

## Development Conventions

### Path Aliases

The project uses path aliases to simplify imports. The following aliases are configured in `vite.config.js`:

*   `@`: `src`
*   `@lib`: `src/lib`
*   `@components`: `src/components`
*   `@hooks`: `src/hooks`

### Code Style

The project uses ESLint to enforce a consistent code style. The configuration can be found in `eslint.config.js`.
