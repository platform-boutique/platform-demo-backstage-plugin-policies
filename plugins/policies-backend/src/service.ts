import { LoggerService } from '@backstage/backend-plugin-api';
import { CustomObjectsApi, KubeConfig } from '@kubernetes/client-node';
import { PolicyFinding, PolicyInfo, ReportSummary, WorkloadReport } from './types';

const POLICY_KINDS: { kind: string; plural: string; actionsAt: (s: any) => string[] }[] = [
  { kind: 'ValidatingPolicy', plural: 'validatingpolicies', actionsAt: s => s.validationActions ?? [] },
  { kind: 'ImageValidatingPolicy', plural: 'imagevalidatingpolicies', actionsAt: s => s.validationActions ?? [] },
  { kind: 'MutatingPolicy', plural: 'mutatingpolicies', actionsAt: () => ['Mutate'] },
  { kind: 'GeneratingPolicy', plural: 'generatingpolicies', actionsAt: () => ['Generate'] },
];

const empty = (): ReportSummary => ({ pass: 0, fail: 0, warn: 0, error: 0, skip: 0 });

export class PoliciesService {
  private readonly api: CustomObjectsApi;
  constructor(private readonly o: { logger: LoggerService; group: string }) {
    const kc = new KubeConfig();
    kc.loadFromDefault(); // pod: its ServiceAccount; laptop: the current context
    this.api = kc.makeApiClient(CustomObjectsApi);
  }

  /**
   * PolicyReports of every object that belongs to a workload. Kyverno writes one report per object (named by its UID), whose
   * `scope` names the object. Our charts name every object of a workload after it (Deployment `frontend`, ReplicaSet and Pod
   * `frontend-<hash>`, Service `frontend`), so a report belongs to the workload when the scope name is the name or starts
   * with `<name>-`. That is a naming convention of this platform, documented in the plugin's docs.
   */
  async workload(namespace: string, workload: string): Promise<WorkloadReport> {
    const res = (await this.api.listNamespacedCustomObject({
      group: 'wgpolicyk8s.io',
      version: 'v1alpha2',
      namespace,
      plural: 'policyreports',
    })) as { items?: any[] };
    const summary = empty();
    const findings: PolicyFinding[] = [];
    let resources = 0;
    for (const r of res.items ?? []) {
      const name: string = r.scope?.name ?? '';
      if (name !== workload && !name.startsWith(`${workload}-`)) continue;
      resources++;
      for (const k of Object.keys(summary) as (keyof ReportSummary)[]) summary[k] += r.summary?.[k] ?? 0;
      for (const x of r.results ?? []) {
        if (x.result === 'pass' || x.result === 'skip') continue;
        findings.push({
          policy: x.policy,
          rule: x.rule,
          result: x.result,
          severity: x.severity,
          category: x.category,
          message: x.message,
          resource: { kind: r.scope?.kind, name, namespace },
        });
      }
    }
    return { namespace, workload, summary, resources, findings };
  }

  /** The policies installed in the cluster and the action each one takes (Deny, Audit, Warn; mutations and generators). */
  async policies(): Promise<PolicyInfo[]> {
    const out: PolicyInfo[] = [];
    await Promise.all(
      POLICY_KINDS.map(async p => {
        try {
          const res = (await this.api.listClusterCustomObject({
            group: this.o.group,
            version: 'v1',
            plural: p.plural,
          })) as { items?: any[] };
          for (const i of res.items ?? []) {
            out.push({
              kind: p.kind,
              name: i.metadata.name,
              ready: i.status?.conditionStatus?.ready,
              actions: p.actionsAt(i.spec ?? {}),
              description: i.metadata?.annotations?.['policies.kyverno.io/description'] ?? i.metadata?.annotations?.description,
            });
          }
        } catch (e) {
          this.o.logger.warn(`policies: cannot list ${p.plural}: ${(e as Error).message}`);
        }
      }),
    );
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }
}
