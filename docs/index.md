# Policies plugin

<div class="pd-hero" markdown>
<span class="pd-kicker">backstage plugin · policy</span>

Kyverno checks every object that enters the cluster and keeps a **PolicyReport** per object. This plugin shows, on the page of a
service, what Kyverno found about everything that belongs to it, and lists the policies themselves with the action each one takes.
</div>

<div class="pd-facts" markdown>
<div><span>Adds</span><strong>Policies tab</strong><small>on entities that run in the cluster</small></div>
<div><span>Adds</span><strong>Policies page</strong><small>every policy and its action</small></div>
<div><span>Reads</span><strong>PolicyReports</strong><small>wgpolicyk8s.io/v1alpha2</small></div>
<div><span>Reads</span><strong>Kyverno policies</strong><small>policies.kyverno.io/v1</small></div>
</div>

## What you see

| Element | Meaning |
|---|---|
| Counters | pass, fail, warn, error and skip results summed over the workload's objects |
| Findings table | One row per failing, erroring or warning result: the policy and rule, the object, Kyverno's message |
| Policies page | Validating, image-validating, mutating and generating policies, the action (**Deny**, **Audit**, mutate, generate) and whether the policy is ready |

!!! info "Why not the TeraSky Kyverno plugin"
    The portal first used `@terasky/backstage-plugin-kyverno-policy-reports`. Its frontend sends an entity without a `kind`, which
    the stock Kubernetes backend refuses (403 *Invalid entity reference*), so its overview never loaded. This plugin does the same
    job without going through the Kubernetes plugin: it lists the reports directly with the portal's read-only ServiceAccount.
