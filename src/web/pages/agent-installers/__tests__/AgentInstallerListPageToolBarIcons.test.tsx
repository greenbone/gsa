/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import AgentInstallersListPageToolBarIcons from 'web/pages/agent-installers/AgentInstallerListPageToolBarIcons';

describe('AgentInstallersListPageToolBarIcons tests', () => {
  test('should handle help icon click', () => {
    const gmp = {
      settings: {manualUrl: 'http://docs.example.com/'},
    };
    const {render} = rendererWith({capabilities: true, gmp});
    render(<AgentInstallersListPageToolBarIcons />);

    const helpIcon = screen.getByTestId('help-icon');
    expect(helpIcon).toBeInTheDocument();

    const helpLink = helpIcon.closest('a');
    expect(helpLink).toHaveAttribute('href');
    expect(helpLink).toHaveAttribute('target', '_blank');
  });

  test('should render manual link with correct attributes', () => {
    const gmp = {
      settings: {manualUrl: 'http://docs.example.com/'},
    };
    const {render} = rendererWith({capabilities: true, gmp});
    render(<AgentInstallersListPageToolBarIcons />);

    const manualLink = screen.getByTestId('manual-link');
    expect(manualLink).toBeInTheDocument();
    expect(manualLink).toHaveAttribute('target', '_blank');
    expect(manualLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
