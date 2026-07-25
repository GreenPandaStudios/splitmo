/**
 * Registers the service worker that makes Splitmo installable and usable offline.
 *
 * A previous build shipped a script that unregistered every worker and deleted every cache on each
 * page load, which is why the PWA never worked. Instead of that, the worker itself claims clients
 * and drops caches from older versions on activate.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  // In dev the worker would sit in front of Vite's HMR pipeline.
  if (!import.meta.env.PROD) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(new URL('sw.js', document.baseURI).href)
      .catch((err) => console.warn('Service worker registration failed:', err));
  });
}
