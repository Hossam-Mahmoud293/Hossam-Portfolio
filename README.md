# Portfolio — Project Structure

This project is organized for clarity and scalability.

## Structure
- `assets/`
  - `css/` — global styles
    - `styles.css`
  - `js/` — scripts
    - `script.js`
  - `img/` — images and icons
    - `favicon.svg`
  - `fonts/` — local webfonts (placeholder)
- `index.html` — site entry point

## Notes
- External libraries are loaded via CDN (GSAP, ScrollTrigger, Google Fonts).
- Use `assets/img/` for any local images you add later.
- Add local fonts into `assets/fonts/` and import them in `assets/css/styles.css` via `@font-face` if needed.

## Development
Open `index.html` in a local server (recommended) to ensure assets and relative paths work consistently across browsers.
