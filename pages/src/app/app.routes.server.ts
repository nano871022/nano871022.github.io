import { RenderMode, ServerRoute } from '@angular/ssr';

// Define the project IDs that you want to prerender.
// This should ideally come from a single source of truth,
// but for prerendering, a static list known at build time is common.
// These IDs match the sample data in ProjectService.
const projectIdsToPrerender = ['1', '2', '3'];

export const serverRoutes: ServerRoute[] = [
  {
    path: 'projects/:id',
    renderMode: RenderMode.Prerender, // Explicitly set prerender for this route
    getPrerenderParams: () => {
      return Promise.resolve(projectIdsToPrerender.map(id => ({ id })));
    }
  },
  {
    path: '**', // Catch-all for other routes
    renderMode: RenderMode.Prerender
    // Note: If other routes also have params, they'd need similar getPrerenderParams.
    // For now, only projects/:id has a known param.
  }
];
