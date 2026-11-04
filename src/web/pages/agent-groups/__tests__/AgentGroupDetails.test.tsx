/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import AgentGroup from 'gmp/models/agent-group';
import AgentGroupDetails from 'web/pages/agent-groups/AgentGroupDetails';

describe('AgentGroupDetails', () => {
  test('should display agent names and scheduler settings', () => {
    const entity = AgentGroup.fromElement({
      _id: 'group-1',
      name: 'Office agents',
      comment: 'Office computers',
      agents: {
        agent: [
          {_id: 'agent-1', name: 'Laptop'},
          {_id: 'agent-2', name: 'Desktop'},
        ],
      },
      scheduler_cron_time: '0 */12 * * *',
      max_delay_seconds: '300',
    });
    const {render} = rendererWith();
    render(<AgentGroupDetails entity={entity} />);

    expect(screen.getByRole('row', {name: 'Name Office agents'})).toBeVisible();
    expect(screen.getByRole('row', {name: /Comment/})).toHaveTextContent(
      'Office computers',
    );
    const agents = screen.getByRole('row', {name: /^Agents/});
    expect(agents).toHaveTextContent('Laptop');
    expect(agents).toHaveTextContent('Desktop');
    expect(
      screen.getByRole('row', {name: /^Cron expression/}),
    ).toHaveTextContent('0 */12 * * *');
    expect(screen.getByRole('row', {name: /^Max delay/})).toHaveTextContent(
      '300',
    );
  });

  test('should display an empty agent list and zero delay', () => {
    const {render} = rendererWith();
    render(<AgentGroupDetails entity={new AgentGroup({id: 'group-1'})} />);

    expect(screen.getByRole('row', {name: 'Agents None'})).toBeVisible();
    expect(screen.getByRole('row', {name: /^Max delay/})).toHaveTextContent(
      '0',
    );
  });
});
