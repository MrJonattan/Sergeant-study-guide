/**
 * Simple hash-based router
 */

type RouteHandler = (params?: Record<string, string>) => void;
type Routes = Record<string, RouteHandler>;

let currentRoute = '';
let onRouteChange: ((route: string, params?: Record<string, string>) => void) | null = null;
let routes: Routes = {};

export function initRouter(
  routerRoutes: Routes,
  onRouteChangeCallback: (route: string, params?: Record<string, string>) => void
) {
  onRouteChange = onRouteChangeCallback;
  routes = routerRoutes;

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();
}

export function navigateTo(hash: string) {
  if (hash !== currentRoute) {
    window.location.hash = hash;
  }
}

function handleHashChange() {
  const hash = window.location.hash.slice(1) || 'home';
  const [route, ...paramParts] = hash.split('/');
  const params: Record<string, string> = {};

  // Parse params from URL (e.g., chapter/208-arrests)
  if (paramParts.length > 0) {
    params.id = paramParts.join('/');
  }

  currentRoute = hash;

  if (onRouteChange) {
    onRouteChange(route, params);
  }

  // Find matching route handler
  let handler: RouteHandler | undefined;

  // Exact match
  if (routes[route]) {
    handler = routes[route];
  }
  // Parameterized route (e.g., chapter/:id)
  else if (routes['chapter/:id'] && route === 'chapter') {
    handler = routes['chapter/:id'];
  }

  if (handler) {
    handler(params);
  } else {
    // 404 - navigate to home
    console.warn(`Route not found: ${hash}`);
    navigateTo('home');
  }
}
