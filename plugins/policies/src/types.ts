export interface PolicyFinding {
  policy: string;
  rule?: string;
  result: string;
  severity?: string;
  category?: string;
  message?: string;
  resource: { kind?: string; name?: string; namespace?: string };
}
export interface ReportSummary { pass: number; fail: number; warn: number; error: number; skip: number }
export interface WorkloadReport {
  namespace: string;
  workload: string;
  summary: ReportSummary;
  resources: number;
  findings: PolicyFinding[];
}
export interface PolicyInfo { kind: string; name: string; ready?: boolean; actions: string[]; description?: string }
