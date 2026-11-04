/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import {Route, Routes} from 'react-router';
import CollectionCounts from 'gmp/collection/collection-counts';
import AgentGroupCommand from 'gmp/commands/agent-group';
import {createEntitiesResponse, createHttp} from 'gmp/commands/testing';
import AgentGroup, {type AgentGroupElement} from 'gmp/models/agent-group';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import AgentGroupDetailsPage from 'web/pages/agent-groups/AgentGroupDetailsPage';
import {ROUTES} from 'web/route-paths';

const groupElement: AgentGroupElement = {
  _id: 'group-1',
  name: 'Office agents',
  comment: 'Office computers',
  owner: {name: 'admin'},
  writable: 1,
  permissions: {permission: {name: 'Everything'}},
  agents: {agent: {_id: 'agent-1', name: 'Laptop'}},
  scheduler_cron_time: '0 */12 * * *',
  max_delay_seconds: 300,
};

const group = AgentGroup.fromElement(groupElement);

const createGmp = () => ({
  session: createSession({token: 'test-token', username: 'admin'}),
  settings: {reloadInterval: -1},
  agentgroup: {
    get: testing.fn().mockResolvedValue({data: group}),
    clone: testing.fn().mockResolvedValue({data: {id: 'cloned-group'}}),
    delete: testing.fn().mockResolvedValue(undefined),
    save: testing.fn().mockResolvedValue(undefined),
  },
  scanners: {
    get: testing.fn().mockResolvedValue({data: []}),
  },
  agents: {
    get: testing.fn().mockResolvedValue({data: []}),
  },
  permissions: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {filter: QueryFilter.fromString(), counts: new CollectionCounts()},
    }),
  },
});

const renderPage = (gmp = createGmp()) => {
  const {render} = rendererWith({
    gmp,
    capabilities: true,
    route: ROUTES.agentGroup.url('group-1'),
  });
  render(
    <Routes>
      <Route
        element={<AgentGroupDetailsPage />}
        path={ROUTES.agentGroup.path}
      />
      <Route
        element={<div>Agent group list</div>}
        path={ROUTES.agentGroups.path}
      />
    </Routes>,
  );
  return gmp;
};

describe('AgentGroupDetailsPage', () => {
  test('should load the group from the URL and display its details', async () => {
    const gmp = createGmp();
    const http = createHttp(
      createEntitiesResponse('agent_group', [{...groupElement}]),
    );
    const command = new AgentGroupCommand(http);
    gmp.agentgroup.get.mockImplementation(params => command.get(params));
    renderPage(gmp);

    expect(await screen.findByText('Agent Group: Office agents')).toBeVisible();
    expect(gmp.agentgroup.get).toHaveBeenCalledWith({id: 'group-1'});
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_agent_groups', filter: 'uuid=group-1 first=1 rows=-1'},
    });
    expect(screen.getByText('Laptop')).toBeVisible();
    expect(screen.getByText('0 */12 * * *')).toBeVisible();
    expect(screen.getByText('300')).toBeVisible();
    expect(screen.getByRole('tab', {name: 'Information'})).toBeVisible();
    expect(screen.getByRole('tab', {name: 'User Tags(0)'})).toBeVisible();
    expect(screen.getByRole('tab', {name: 'Permissions(0)'})).toBeVisible();
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      ROUTES.agentGroups.url,
    );
  });

  test('should display a loading indicator until the group is available', () => {
    const gmp = createGmp();
    gmp.agentgroup.get.mockReturnValue(new Promise(() => {}));
    renderPage(gmp);

    expect(screen.getByTestId('loading')).toBeVisible();
    expect(screen.queryByTestId('clone-icon')).not.toBeInTheDocument();
  });

  test('should display a request error', async () => {
    const gmp = createGmp();
    gmp.agentgroup.get.mockRejectedValue(
      new Error('Unable to load agent group'),
    );
    renderPage(gmp);

    expect(await screen.findByText('Unable to load agent group')).toBeVisible();
  });

  test('should navigate to the cloned group', async () => {
    const gmp = renderPage();
    fireEvent.click(await screen.findByTestId('clone-icon'));

    await waitFor(() => {
      expect(gmp.agentgroup.clone).toHaveBeenCalledWith({id: 'group-1'});
      expect(gmp.agentgroup.get).toHaveBeenCalledWith({id: 'cloned-group'});
    });
  });

  test('should return to the list after deleting the group', async () => {
    const gmp = renderPage();
    fireEvent.click(await screen.findByTestId('trashcan-icon'));

    expect(await screen.findByText('Agent group list')).toBeVisible();
    expect(gmp.agentgroup.delete).toHaveBeenCalledWith({id: 'group-1'});
  });

  test('should refresh details after editing the group', async () => {
    const gmp = createGmp();
    const updatedGroup = AgentGroup.fromElement({
      ...groupElement,
      name: 'Updated group',
    });
    gmp.agentgroup.save.mockImplementation(async () => {
      gmp.agentgroup.get.mockResolvedValue({data: updatedGroup});
    });
    renderPage(gmp);

    fireEvent.click(await screen.findByTestId('edit-icon'));
    const input = await screen.findByRole('textbox', {name: 'Group Name'});
    fireEvent.change(input, {target: {value: 'Updated group'}});
    fireEvent.click(screen.getDialogSaveButton());

    expect(await screen.findByText('Agent Group: Updated group')).toBeVisible();
    expect(gmp.agentgroup.save).toHaveBeenCalledWith(
      expect.objectContaining({id: 'group-1', name: 'Updated group'}),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
