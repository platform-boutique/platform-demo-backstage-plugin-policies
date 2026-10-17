import { HttpAuthService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import express from 'express';
import Router from 'express-promise-router';
import { PoliciesService } from './service';

const NAME = /^[a-z0-9]([-a-z0-9.]*[a-z0-9])?$/;

export async function createRouter(o: { httpAuth: HttpAuthService; service: PoliciesService }): Promise<express.Router> {
  const router = Router();
  router.use(async (req, _res, next) => {
    await o.httpAuth.credentials(req, { allow: ['user'] });
    next();
  });

  /** GET /workload?namespace=platform-demo&name=frontend : what Kyverno found about the workload's objects. */
  router.get('/workload', async (req, res) => {
    const namespace = String(req.query.namespace ?? '');
    const name = String(req.query.name ?? '');
    if (!NAME.test(namespace) || !NAME.test(name)) throw new InputError('namespace and name must be Kubernetes names');
    res.json(await o.service.workload(namespace, name));
  });

  /** GET /policies : the installed policies and what each does. */
  router.get('/policies', async (_req, res) => {
    res.json({ policies: await o.service.policies() });
  });

  return router;
}
