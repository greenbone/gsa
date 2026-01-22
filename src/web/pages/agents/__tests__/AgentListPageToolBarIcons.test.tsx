/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import AgentsListPageToolBarIcons from 'web/pages/agents/AgentListPageToolBarIcons';

describe('AgentsListPageToolBarIcons tests', () => {
  test('should render toolbar icons', () => {
    const gmp = {
      settings: {
        manualUrl: 'https://docs.greenbone.net',
      },
    };

    const {render} = rendererWith({
      capabilities: new EverythingCapabilities(),
      gmp,
    });

    render(<AgentsListPageToolBarIcons />);

    expect(screen.getByTestId('help-icon')).toBeInTheDocument();
  });
});
