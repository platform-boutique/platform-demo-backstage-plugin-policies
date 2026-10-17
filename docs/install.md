# Install and configure

| Package | Role |
|---|---|
| `@platform-boutique/backstage-plugin-policies` | Frontend plugin (new frontend system) |
| `@platform-boutique/backstage-plugin-policies-backend` | Backend plugin |

```ts title="packages/backend/src/index.ts"
backend.add(import('@platform-boutique/backstage-plugin-policies-backend'));
```

The frontend has a default export, so `app.packages: all` picks it up. Entities need `backstage.io/kubernetes-label-selector`
(`app.kubernetes.io/name=<workload>`) and `backstage.io/kubernetes-namespace`.

```yaml title="app-config.yaml (optional)"
policies:
  group: policies.kyverno.io
```

## What the cluster must allow

`get` and `list` on `policyreports.wgpolicyk8s.io` and on the policy kinds of `policies.kyverno.io`. The portal's ClusterRole
(`backstage-read` in the Helm repository) has both. Kyverno's *reports controller* needs RBAC for the kinds it validates, otherwise
there are no reports to show (see the Kyverno README in the Helm repository).

## Develop

```bash
yarn install && yarn tsc && yarn build && yarn backstage-cli repo fix --publish
for p in policies policies-backend; do (cd plugins/$p && yarn pack --out ../../dist-pack/$p.tgz); done
```

Copy the tarballs into the portal's `vendor/` folder and rebuild its image.
