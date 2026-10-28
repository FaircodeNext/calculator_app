# Desk Calculator

Desk Calculator adds a small calculator that stays available while you work in Frappe Desk.

## Features

- Open the calculator from any Desk page.
- Drag the floating calculator icon to a clear part of the screen; its position is saved in your browser.
- Evaluate arithmetic and scientific expressions, including powers, roots, trigonometric functions, logarithms, and constants.
- Choose degree or radian mode and use the keyboard to edit and calculate expressions.
- Calculate locally in the browser without sending expressions to an external service.

## Supported versions

- Frappe Framework 16
- ERPNext 16 (when installed)

## Development

The frontend source is in `frontend/`; the compiled assets are served from `calculator_app/public/dist/`.

```bash
cd frontend
npm ci
npm test
npm run build
```

## Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch version-16
bench install-app calculator_app
```

## Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/calculator_app
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

## License

MIT. See [license.txt](license.txt).
