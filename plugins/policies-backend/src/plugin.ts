import { coreServices, createBackendPlugin } from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { PoliciesService } from './service';

/**
 * Backend of the Policies view: Kyverno PolicyReports per workload and the list of installed policies, read with the portal's
 * read-only ServiceAccount (needs get/list on policyreports.wgpolicyk8s.io and the policies.kyverno.io kinds).
 *
 * @public
 */
export const policiesPlugin = createBackendPlugin({
  pluginId: 'policies',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
      },
      async init({ config, httpAuth, httpRouter, logger }) {
        const service = new PoliciesService({ logger, group: config.getOptionalString('policies.group') ?? 'policies.kyverno.io' });
        httpRouter.use(await createRouter({ httpAuth, service }));
      },
    });
  },
});
