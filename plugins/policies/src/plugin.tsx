import { ApiBlueprint, PageBlueprint, createFrontendPlugin, discoveryApiRef, fetchApiRef } from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { policiesApiRef, PoliciesClient } from './api';
import { rootRouteRef } from './routes';

const policiesApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: policiesApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: deps => new PoliciesClient(deps),
    }),
});

/** Tab "Policies" on every entity that runs in the cluster: what Kyverno found about its objects. */
const entityPoliciesContent = EntityContentBlueprint.make({
  name: 'policies',
  params: {
    path: '/policies',
    title: 'Policies',
    filter: entity =>
      Boolean(entity.metadata.annotations?.['backstage.io/kubernetes-label-selector'] && entity.metadata.annotations?.['backstage.io/kubernetes-namespace']),
    loader: () => import('./components/EntityPoliciesContent').then(m => <m.EntityPoliciesContent />),
  },
});

const policiesPage = PageBlueprint.make({
  params: {
    path: '/policies',
    title: 'Policies',
    routeRef: rootRouteRef,
    loader: () => import('./components/PoliciesPage').then(m => <m.PoliciesPage />),
  },
});

export const policiesPlugin = createFrontendPlugin({
  pluginId: 'policies',
  extensions: [policiesApi, entityPoliciesContent, policiesPage],
  routes: { root: rootRouteRef },
});
