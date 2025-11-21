// main.js: Entry point for the application.

import { App } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    // Expose the app instance to the window for debugging, similar to the original.
    window._app = new App();
});
