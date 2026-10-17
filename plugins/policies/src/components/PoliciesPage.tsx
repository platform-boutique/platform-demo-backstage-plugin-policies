import { useApi } from '@backstage/frontend-plugin-api';
import { Content, Header, InfoCard, Page, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { Chip, Table, TableBody, TableCell, TableHead, TableRow, makeStyles } from '@material-ui/core';
import useAsync from 'react-use/esm/useAsync';
import { policiesApiRef } from '../api';

const useStyles = makeStyles(theme => ({
  chip: { fontWeight: 600, height: 22, marginRight: 4, color: '#fff' },
  Deny: { background: theme.palette.error.main },
  Audit: { background: theme.palette.warning?.main ?? '#ed6c02' },
  other: { background: theme.palette.grey[600] },
  mono: { fontFamily: 'monospace', fontSize: '0.8rem' },
}));

export function PoliciesPage() {
  const c = useStyles();
  const api = useApi(policiesApiRef);
  const state = useAsync(() => api.policies(), []);
  return (
    <Page themeId="tool">
      <Header title="Policies" subtitle="Kyverno admission policies and what each one does" />
      <Content>
        {state.loading && <Progress />}
        {state.error && <ResponseErrorPanel error={state.error} />}
        {state.value && (
          <InfoCard title={`${state.value.length} policies`} noPadding>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Policy</TableCell>
                  <TableCell>Kind</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Ready</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {state.value.map(p => (
                  <TableRow key={`${p.kind}-${p.name}`} hover>
                    <TableCell className={c.mono}>{p.name}</TableCell>
                    <TableCell>{p.kind}</TableCell>
                    <TableCell>
                      {p.actions.map(a => (
                        <Chip key={a} size="small" className={`${c.chip} ${(c as any)[a] ?? c.other}`} label={a} />
                      ))}
                    </TableCell>
                    <TableCell>{p.ready === undefined ? '' : p.ready ? 'yes' : 'no'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </InfoCard>
        )}
      </Content>
    </Page>
  );
}
