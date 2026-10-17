export interface PolicyFinding {
  policy: string;
  rule?: string;
  result: string; // fail | error | warn
  severity?: string;
  category?: string;
  message?: string;
  resource: { kind?: string; name?: string; namespace?: string };
}

export interface ReportSummary {
  pass: number;
  fail: number;
  warn: number;
  error: number;
  skip: number;
}

export interface WorkloadReport {
  namespace: string;
  workload: string;
  summary: ReportSummary;
  /** number of resources (pods, deployments, services ...) whose reports were counted */
  resources: number;
  findings: PolicyFinding[];
}

export interface PolicyInfo {
  kind: string;
  name: string;
  ready?: boolean;
  /** Deny | Audit | Warn ... as set in the policy */
  actions: string[];
  description?: string;
}
