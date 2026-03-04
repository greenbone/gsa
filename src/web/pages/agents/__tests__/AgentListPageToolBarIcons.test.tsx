/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import dayjs from 'dayjs';
import AgentsListPageToolBarIcons from 'web/pages/agents/AgentListPageToolBarIcons';

const gmp = {
  settings: {
    manualUrl: 'https://docs.greenbone.net',
  },
};

describe('AgentsListPageToolBarIcons tests', () => {
  test('should render toolbar icons', () => {
    const {render} = rendererWith({
      capabilities: true,
      gmp,
    });

    render(<AgentsListPageToolBarIcons onSyncClick={testing.fn()} />);

    expect(screen.getByTestId('help-icon')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-ccw-icon')).toBeInTheDocument();
  });

  test('should call onSyncClick when sync icon is clicked', () => {
    const onSyncClick = testing.fn();

    const {render} = rendererWith({capabilities: true, gmp});

    render(<AgentsListPageToolBarIcons onSyncClick={onSyncClick} />);

    fireEvent.click(screen.getByTitle('Sync Agents'));

    expect(onSyncClick).toHaveBeenCalledTimes(1);
  });

  test('should not render last updated when lastUpdatedAt is not set', () => {
    const {render} = rendererWith({capabilities: true, gmp});

    render(<AgentsListPageToolBarIcons onSyncClick={testing.fn()} />);

    expect(screen.queryByText(/Last updated/i)).not.toBeInTheDocument();
  });

  test('should render last updated timestamp when lastUpdatedAt is set', () => {
    const {render} = rendererWith({capabilities: true, gmp});

    render(
      <AgentsListPageToolBarIcons
        lastUpdatedAt={dayjs('2026-03-04T14:32:05Z')}
        onSyncClick={testing.fn()}
      />,
    );

    expect(screen.getByText(/Last updated/i)).toBeInTheDocument();
  });
});
