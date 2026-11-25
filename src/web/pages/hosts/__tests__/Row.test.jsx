/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTableBody, screen} from 'web/testing';
import Features from 'gmp/capabilities/features';
import Host from 'gmp/models/host';
import {createSession} from 'gmp/testing';
import Row from 'web/pages/hosts/Row';

const agentId = 'GAT-29::2d61a736';

const createHost = ({detail, identifier = agentId, includeHost = true} = {}) =>
  Host.fromElement({
    _id: 'host-1',
    name: '192.168.178.64',
    host: includeHost
      ? {
          detail:
            detail === undefined ? [] : [{name: 'agentID', value: detail}],
        }
      : undefined,
    identifiers: {
      identifier: [
        {name: 'ip', value: '192.168.178.64'},
        ...(identifier === undefined
          ? []
          : [{_id: 'agent-identifier', name: 'agentID', value: identifier}]),
      ],
    },
  });

const renderHost = (host, features = new Features(['ENABLE_AGENTS'])) => {
  const {render} = rendererWithTableBody({
    gmp: {settings: {}, session: createSession()},
    features,
    capabilities: true,
  });

  return render(<Row entity={host} onToggleDetailsClick={testing.fn()} />);
};

describe('Host Row agent ID', () => {
  test.each([undefined, '', null])(
    'should display the identifier when the detail value is %s',
    detail => {
      const host = createHost({detail});
      renderHost(host);

      expect(screen.getAllByRole('cell')[2]).toHaveTextContent(agentId);
      expect(host.identifiers[1].name).toBe('agentID');
      expect(host.identifiers[1].value).toBe(agentId);
    },
  );

  test('should display the identifier when host details are absent', () => {
    renderHost(createHost({includeHost: false}));

    expect(screen.getAllByRole('cell')[2]).toHaveTextContent(agentId);
  });

  test('should use the identifier even when a detail exists', () => {
    renderHost(createHost({detail: 'detail-agent'}));

    expect(screen.getAllByRole('cell')[2]).toHaveTextContent(agentId);
    expect(screen.queryByText('detail-agent')).not.toBeInTheDocument();
  });

  test('should leave the cell empty when only a detail exists', () => {
    const host = createHost({detail: 'detail-agent'});
    host.identifiers.splice(1, 1);
    renderHost(host);

    expect(screen.getAllByRole('cell')[2].textContent).toBe('');
  });

  test('should leave the cell empty when no agent ID exists', () => {
    const host = createHost();
    host.identifiers.splice(1, 1);
    renderHost(host);

    expect(screen.getAllByRole('cell')[2].textContent).toBe('');
  });

  test('should hide the agent ID cell when agents are disabled', () => {
    renderHost(createHost(), new Features());

    expect(screen.queryByText(agentId)).not.toBeInTheDocument();
    expect(screen.getAllByRole('cell')).toHaveLength(7);
  });
});
