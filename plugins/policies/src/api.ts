import { createApiRef, DiscoveryApi, FetchApi } from '@backstage/frontend-plugin-api';
import { ResponseError } from '@backstage/errors';
import { PolicyInfo, WorkloadReport } from './types';

export interface PoliciesApi {
  workload(namespace: string, name: string): Promise<WorkloadReport>;
  policies(): Promise<PolicyInfo[]>;
}
export const policiesApiRef = createApiRef<PoliciesApi>({ id: 'plugin.policies.service' });

export class PoliciesClient implements PoliciesApi {
  constructor(private readonly deps: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {}
  private async get<T>(path: string): Promise<T> {
    const base = await this.deps.discoveryApi.getBaseUrl('policies');
    const res = await this.deps.fetchApi.fetch(`${base}${path}`);
    if (!res.ok) throw await ResponseError.fromResponse(res);
    return res.json();
  }
  workload(namespace: string, name: string) {
    return this.get<WorkloadReport>(`/workload?namespace=${encodeURIComponent(namespace)}&name=${encodeURIComponent(name)}`);
  }
  async policies() {
    return (await this.get<{ policies: PolicyInfo[] }>('/policies')).policies;
  }
}
