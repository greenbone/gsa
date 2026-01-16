/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import CollectionCounts from 'gmp/collection/collection-counts';
import AgentGroup from 'gmp/models/agent-group';
import Filter from 'gmp/models/filter';
import AgentGroupsListPage from 'web/pages/agent-groups/AgentGroupsListPage';

const makeGroup = (id = 'g1') =>
  new AgentGroup({
    id,
    name: `Group ${id}`,
    scanner: {id: 's1', name: 'Scanner 1'},
    agents: [{id: 'a1'}],
    userCapabilities: new EverythingCapabilities(),
  });

describe('AgentGroupsListPage tests', () => {
  test('renders full AgentGroupsListPage with data and toolbar', async () => {
    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });

    const getAgentGroups = testing.fn().mockResolvedValue({
      data: [makeGroup('g1')],
      meta: {filter: Filter.fromString(), counts},
    });

    const gmp = {
      agentgroup: {
        create: testing.fn().mockResolvedValue({id: 'created'}),
        clone: testing.fn().mockResolvedValue({id: 'cloned'}),
        save: testing.fn().mockResolvedValue({id: 'saved'}),
        delete: testing.fn().mockResolvedValue(undefined),
      },
      agentgroups: {
        get: getAgentGroups,
      },
      // minimal filters and user stubs required by EntitiesPage mount
      filters: {
        get: testing.fn().mockResolvedValue({
          data: [],
          meta: {
            filter: Filter.fromString(),
            counts: new CollectionCounts({
              first: 0,
              all: 0,
              filtered: 0,
              length: 0,
              rows: 0,
            }),
          },
        }),
      },
      user: {
        getSetting: testing.fn().mockResolvedValue({data: null}),
      },
      settings: {token: 'token'},
    };

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(<AgentGroupsListPage />);

    // wait for data row
    await screen.findByText(/Group g1/i);

    // toolbar icons
    expect(screen.getByTitle('Help: Agents Lists')).toBeInTheDocument();
    expect(screen.getByTitle('New Agent')).toBeInTheDocument();

    // table headers and row
    expect(screen.getByText('Group Name')).toBeInTheDocument();
    expect(screen.getByText('Last Update')).toBeInTheDocument();
    expect(screen.getByText('Group g1')).toBeInTheDocument();

    // row actions (clone/edit/delete) should be present by title
    expect(screen.getByTitle('Clone Agent Group')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Agent Group')).toBeInTheDocument();
    expect(
      screen.getByTitle('Move Agent Group to trashcan'),
    ).toBeInTheDocument();
  });

  test('handles bulk delete and shows confirmation dialog', async () => {
    const counts = new CollectionCounts({
      first: 1,
      all: 2,
      filtered: 2,
      length: 2,
      rows: 10,
    });

    const groups = [makeGroup('g1'), makeGroup('g2')];

    const getAgentGroups = testing.fn().mockResolvedValue({
      data: groups,
      meta: {filter: Filter.fromString(), counts},
    });

    const deleteMock = testing.fn().mockResolvedValue(undefined);

    const gmp = {
      agentgroup: {
        create: testing.fn(),
        clone: testing.fn(),
        save: testing.fn(),
        delete: deleteMock,
      },
      agentgroups: {get: getAgentGroups},
      filters: {
        get: testing.fn().mockResolvedValue({
          data: [],
          meta: {
            filter: Filter.fromString(),
            counts: new CollectionCounts({
              first: 0,
              all: 0,
              filtered: 0,
              length: 0,
              rows: 0,
            }),
          },
        }),
      },
      user: {
        getSetting: testing.fn().mockResolvedValue({data: null}),
      },
      settings: {token: 'token'},
    };

    const {render} = rendererWith({gmp, capabilities: true, router: true});

    render(<AgentGroupsListPage />);

    await screen.findByText(/Group g1/i);

    // click bulk delete icon on page (Move page contents to trashcan)
    const deleteIcon = screen.getByTitle('Move page contents to trashcan');
    fireEvent.click(deleteIcon);

    // confirm dialog open
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeVisible();

    const moveButton = screen.getByText('Move to Trashcan');
    fireEvent.click(moveButton);

    // wait for delete mock to be called
    await wait();
    expect(deleteMock).toHaveBeenCalled();
  });

  test('shows error notification when fetch fails', async () => {
    const getAgentGroups = testing.fn().mockRejectedValue(new Error('boom'));

    const gmp = {
      agentgroup: {
        create: testing.fn(),
        clone: testing.fn(),
        save: testing.fn(),
        delete: testing.fn(),
      },
      agentgroups: {get: getAgentGroups},
      filters: {
        get: testing.fn().mockResolvedValue({
          data: [],
          meta: {
            filter: Filter.fromString(),
            counts: new CollectionCounts({
              first: 0,
              all: 0,
              filtered: 0,
              length: 0,
              rows: 0,
            }),
          },
        }),
      },
      user: {
        getSetting: testing.fn().mockResolvedValue({data: null}),
      },
      settings: {token: 'token'},
    };

    const {render} = rendererWith({gmp, capabilities: true});

    render(<AgentGroupsListPage />);

    // error renders on page
    const errorEl = await screen.findByTestId('error-message');
    expect(errorEl).toBeInTheDocument();
    // should contain either the underlying error message or a generic message
    expect(errorEl.textContent).toMatch(/boom|An error occurred/i);
  });
});
