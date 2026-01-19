/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import AgentTableHeader from 'web/pages/agents/AgentTableHeader';

describe('AgentTableHeader tests', () => {
  test('should render table header', () => {
    const {render} = rendererWith({});
    render(<AgentTableHeader />);

    expect(screen.getByText('Agent')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Last Contact')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Authorized')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(7); // Agent, Network, Version, Last Contact, Status, Authorized, Actions
  });
});
