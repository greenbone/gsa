/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import AgentGroupsListPageToolBarIcons from 'web/pages/agent-groups/AgentGroupsListPageToolBarIcons';

describe('AgentGroupsListPageToolBarIcons tests', () => {
  test('should render help and new icon when allowed', () => {
    const onCreate = testing.fn();
    const gmp = {
      settings: {manualUrl: 'https://manual', manualLanguageMapping: {}},
    };
    const {render} = rendererWith({capabilities: true, gmp});

    render(<AgentGroupsListPageToolBarIcons onAgentCreateClick={onCreate} />);

    expect(screen.getByTitle('Help: Agents Lists')).toBeInTheDocument();
    expect(screen.getByTitle('New Agent')).toBeInTheDocument();

    const newIcon = screen.getByTitle('New Agent');
    fireEvent.click(newIcon);
    expect(onCreate).toHaveBeenCalled();
  });

  test("should not render New icon when create isn't allowed", () => {
    const onCreate = testing.fn();
    const gmp = {
      settings: {manualUrl: 'https://manual', manualLanguageMapping: {}},
    };
    const {render} = rendererWith({capabilities: false, gmp});

    render(<AgentGroupsListPageToolBarIcons onAgentCreateClick={onCreate} />);

    expect(screen.getByTitle('Help: Agents Lists')).toBeInTheDocument();
    expect(screen.queryByTitle('New Agent')).not.toBeInTheDocument();
  });
});
