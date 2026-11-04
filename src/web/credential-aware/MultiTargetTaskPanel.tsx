/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {Link} from 'react-router';
import Button from 'web/components/form/Button';
import {type GroupSummary} from 'web/credential-aware/api';
import {useMultiTargetTasks} from 'web/credential-aware/MultiTargetTaskContext';
import {ROUTES} from 'web/route-paths';

interface Props {
  group: GroupSummary;
}

const ACTIVE = ['Running', 'Requested', 'Queued'];

const MultiTargetTaskPanel = ({group}: Props) => {
  const {start, stop, refresh} = useMultiTargetTasks();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = group.children.some(child => ACTIVE.includes(child.status));

  const act = async (operation: 'start' | 'stop') => {
    setBusy(true);
    setError('');
    try {
      if (operation === 'start') {
        await start(group);
      } else {
        await stop(group);
      }
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label={`Multi-target task ${group.name}`}>
      <p>
        <strong>Multi-target scan</strong> · {group.host_count} hosts ·{' '}
        {group.done_count} completed · {group.status}
      </p>
      {error && <p role="alert">{error}</p>}
      {group.native_error && (
        <p role="alert">
          Combined report publication needs attention: {group.native_error}
        </p>
      )}
      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
        {active ? (
          <Button
            disabled={busy}
            type="button"
            onClick={() => void act('stop')}
          >
            Stop all hosts
          </Button>
        ) : (
          <Button
            disabled={busy}
            type="button"
            onClick={() => void act('start')}
          >
            {group.report_count ? 'Run again' : 'Start scan'}
          </Button>
        )}
        <Button
          disabled={busy}
          type="button"
          variant="outline"
          onClick={() => void refresh()}
        >
          Refresh status
        </Button>
        {group.native_report_id && (
          <Link to={ROUTES.report.url(group.native_report_id)}>
            Open combined report
          </Link>
        )}
      </div>
      <table style={{width: '100%', textAlign: 'left', marginTop: '0.8rem'}}>
        <thead>
          <tr>
            <th>Hosts</th>
            <th>Status</th>
            <th>Scan report</th>
          </tr>
        </thead>
        <tbody>
          {group.children.map(child => (
            <tr key={child.task_id}>
              <td>
                <Link to={ROUTES.task.url(child.task_id)}>
                  {child.hosts?.join(', ') || child.host}
                </Link>
              </td>
              <td>
                {child.status}
                {child.error && ` — ${child.error}`}
              </td>
              <td>
                {child.report_id ? (
                  <Link to={ROUTES.report.url(child.report_id)}>
                    Open scan report
                  </Link>
                ) : (
                  'Pending'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        The combined report is published after every scan completes. Source
        reports remain available for full scan detail.
      </p>
    </section>
  );
};

export default MultiTargetTaskPanel;
