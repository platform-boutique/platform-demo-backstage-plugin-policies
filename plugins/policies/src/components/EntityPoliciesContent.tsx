import { useApi } from '@backstage/frontend-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard, MissingAnnotationEmptyState, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { Chip, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography, makeStyles } from '@material-ui/core';
import useAsync from 'react-use/esm/useAsync';
import { policiesApiRef } from '../api';

const SELECTOR = 'backstage.io/kubernetes-label-selector';
const NAMESPACE = 'backstage.io/kubernetes-namespace';

const useStyles = makeStyles(theme => ({
  stat: { padding: theme.spacing(1.5, 2), border: `1px solid ${theme.palette.divider}`, borderRadius: 12 },
  value: { fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.1 },
  label: { fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 },
  chip: { fontWeight: 600, height: 22, color: '#fff' },
  fail: { background: theme.palette.error.main },
  warn: { background: theme.palette.warning?.main ?? '#ed6c02' },
  mono: { fontFamily: 'monospace', fontSize: '0.8rem' },
}));

function workloadOf(selector?: string) {
  return selector?.split(',').map(s => s.trim()).find(s => s.startsWith('app.kubernetes.io/name='))?.split('=')[1];
}

export function EntityPoliciesContent() {
  const c = useStyles();
  const { entity } = useEntity();
  const api = useApi(policiesApiRef);
  const a = entity.metadata.annotations ?? {};
  const workload = workloadOf(a[SELECTOR]) ?? a['backstage.io/kubernetes-id'];
  const namespace = a[NAMESPACE];
  const state = useAsync(() => (workload && namespace ? api.workload(namespace, workload) : Promise.resolve(undefined)), [workload, namespace]);

  if (!workload || !namespace) return <MissingAnnotationEmptyState annotation={SELECTOR} />;
  if (state.loading) return <Progress />;
  if (state.error) return <ResponseErrorPanel error={state.error} />;
  const r = state.value!;

  return (
    <Grid container spacing={3}>
      {(['pass', 'fail', 'warn', 'error', 'skip'] as const).map(k => (
        <Grid item xs={6} md key={k}>
          <div className={c.stat}>
            <div className={c.value}>{r.summary[k]}</div>
            <div className={c.label}>{k}</div>
          </div>
        </Grid>
      ))}
      <Grid item xs={12}>
        <InfoCard
          title={`Findings for ${workload}`}
          subheader={`${r.resources} objects checked by Kyverno in ${namespace}. Audit-mode policies report here without blocking anything.`}
          noPadding
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Result</TableCell>
                <TableCell>Policy</TableCell>
                <TableCell>Object</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {r.findings.map((f, i) => (
                <TableRow key={`${f.policy}-${f.resource.name}-${i}`} hover>
                  <TableCell>
                    <Chip size="small" className={`${c.chip} ${f.result === 'fail' || f.result === 'error' ? c.fail : c.warn}`} label={f.result} />
                  </TableCell>
                  <TableCell className={c.mono}>{f.policy}{f.rule ? ` / ${f.rule}` : ''}</TableCell>
                  <TableCell className={c.mono}>{f.resource.kind}/{f.resource.name}</TableCell>
                  <TableCell>{f.message}</TableCell>
                </TableRow>
              ))}
              {r.findings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography style={{ padding: 8 }}>No failures, warnings or errors. {r.resources === 0 ? 'No PolicyReport exists for this workload yet.' : ''}</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </InfoCard>
      </Grid>
    </Grid>
  );
}
