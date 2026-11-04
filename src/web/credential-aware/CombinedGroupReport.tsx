/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router';
import Button from 'web/components/form/Button';
import {
  credentialAwareApi,
  downloadCombinedReport,
  type GroupReport,
} from 'web/credential-aware/api';
import useSessionToken from 'web/hooks/useSessionToken';
import {ROUTES} from 'web/route-paths';

const PAGE_SIZE = 100;

interface Props {
  groupId: string;
}

const CombinedGroupReport = ({groupId}: Props) => {
  const token = useSessionToken();
  const [offset, setOffset] = useState(0);
  const [report, setReport] = useState<GroupReport>();
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await credentialAwareApi<GroupReport>(
        token,
        `groups/${encodeURIComponent(groupId)}/report?offset=${offset}&limit=${PAGE_SIZE}`,
      );
      setReport(data);
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  }, [groupId, offset, token]);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  const download = async () => {
    setDownloading(true);
    try {
      await downloadCombinedReport(token, groupId);
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section aria-label="Combined group report" style={{padding: '1rem'}}>
      <h3>Scan progress and combined results — {report?.name ?? 'Loading…'}</h3>
      <p>
        Results from each host's latest report appear together here. During a
        new run, previous and current results may appear together until all
        hosts finish. Open a host report for its full report controls.
      </p>
      {error && <p role="alert">{error}</p>}
      {report && (
        <>
          <p>
            {report.status} · {report.done_count}/{report.host_count} hosts done
            · {report.report_count} latest reports · {report.result_count}{' '}
            matching results
          </p>
          {!report.complete && (
            <p role="alert">
              One or more child tasks or reports could not be read. Counts and
              results may be incomplete; CSV export is disabled.
            </p>
          )}
          <Button
            disabled={
              downloading || !report.complete || report.report_count === 0
            }
            type="button"
            onClick={() => void download()}
          >
            Download combined CSV
          </Button>{' '}
          <Button type="button" onClick={() => void refresh()}>
            Refresh
          </Button>
          <h4>Hosts and native reports</h4>
          <table style={{width: '100%', textAlign: 'left'}}>
            <thead>
              <tr>
                <th>Host</th>
                <th>Status</th>
                <th>Results</th>
                <th>Native report</th>
              </tr>
            </thead>
            <tbody>
              {report.children.map(child => (
                <tr key={child.task_id}>
                  <td>{child.host}</td>
                  <td>
                    {child.status}
                    {child.error && ` — ${child.error}`}
                  </td>
                  <td>{child.result_count ?? 0}</td>
                  <td>
                    {child.report_id ? (
                      <Link to={ROUTES.report.url(child.report_id)}>
                        Open report
                      </Link>
                    ) : (
                      <Link to={ROUTES.task.url(child.task_id)}>Open task</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h4>Combined results</h4>
          {report.result_count === 0 && (
            <p>No matching results have been reported yet.</p>
          )}
          <table style={{width: '100%', textAlign: 'left'}}>
            <thead>
              <tr>
                <th>Host</th>
                <th>Severity</th>
                <th>Result</th>
                <th>Port</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
              {report.results.map(result => (
                <tr key={result.id}>
                  <td>{result.host}</td>
                  <td>{result.severity}</td>
                  <td>
                    <Link to={ROUTES.result.url(result.id)}>{result.name}</Link>
                    {result.description && (
                      <details>
                        <summary>Details</summary>
                        <pre style={{whiteSpace: 'pre-wrap'}}>
                          {result.description}
                        </pre>
                      </details>
                    )}
                  </td>
                  <td>{result.port}</td>
                  <td>
                    <Link to={ROUTES.report.url(result.report_id)}>
                      Open report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Showing {report.results.length ? report.offset + 1 : 0}–
            {report.offset + report.results.length} of {report.result_count}.
          </p>
          <Button
            disabled={offset === 0}
            type="button"
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            Previous results
          </Button>{' '}
          <Button
            disabled={offset + report.results.length >= report.result_count}
            type="button"
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            Next results
          </Button>
        </>
      )}
    </section>
  );
};

export default CombinedGroupReport;
