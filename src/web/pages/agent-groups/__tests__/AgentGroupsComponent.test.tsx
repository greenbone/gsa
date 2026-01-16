/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import Response from 'gmp/http/response';
import AgentGroup from 'gmp/models/agent-group';
import Button from 'web/components/form/Button';
import AgentGroupsComponent from 'web/pages/agent-groups/AgentGroupsComponent';

const sampleAgentGroup: AgentGroup = new AgentGroup({id: 'g1', name: 'group1'});

describe('AgentGroupsComponent tests', () => {
  test('should open dialog for edit and call save mutation', async () => {
    const onSaved = testing.fn();

    const gmp = {
      settings: {token: 'token'},
      scanners: {get: testing.fn().mockResolvedValue(new Response([], {}))},
      agents: {get: testing.fn().mockResolvedValue(new Response([], {}))},
      agentgroup: {
        create: testing.fn().mockResolvedValue({id: '123'}),
        clone: testing.fn(),
        delete: testing.fn().mockResolvedValue(undefined),
        save: testing.fn().mockResolvedValue(undefined),
      },
    };

    type AgentGroupsActions = {
      create: () => void;
      clone: (entity: AgentGroup) => void;
      delete: (entity: AgentGroup) => Promise<void> | void;
      edit: (entity: AgentGroup) => void;
    };
    let actions: AgentGroupsActions | undefined;
    const {render} = rendererWith({gmp});

    render(
      <AgentGroupsComponent onSaved={onSaved}>
        {(props: AgentGroupsActions) => {
          actions = props;
          return <div />;
        }}
      </AgentGroupsComponent>,
    );

    // open dialog in edit mode with a sample group
    actions?.edit(sampleAgentGroup);
    await wait();

    const titleElement = screen.getDialogTitle();
    expect(titleElement).toHaveTextContent('Edit Agent Group');
    expect(titleElement).toHaveTextContent('group1');

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    await wait();

    expect(gmp.agentgroup.save).toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalled();
  });

  test('clone and delete handlers call gmp methods', async () => {
    const gmp = {
      settings: {token: 'token'},
      scanners: {get: testing.fn().mockResolvedValue(new Response([], {}))},
      agents: {get: testing.fn().mockResolvedValue(new Response([], {}))},
      agentgroup: {
        create: testing.fn().mockResolvedValue({id: '123'}),
        clone: testing.fn().mockResolvedValue({id: 'cloned'}),
        delete: testing.fn().mockResolvedValue(undefined),
        save: testing.fn(),
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <AgentGroupsComponent>
        {({clone, delete: del}) => (
          <div>
            <Button
              data-testid="clone"
              onClick={() => clone(sampleAgentGroup)}
            />
            <Button
              data-testid="delete"
              onClick={() => del(sampleAgentGroup)}
            />
          </div>
        )}
      </AgentGroupsComponent>,
    );

    fireEvent.click(screen.getByTestId('clone'));
    expect(gmp.agentgroup.clone).toHaveBeenCalledWith(sampleAgentGroup);

    // delete returns a promise; call and await it
    const res = screen.getByTestId('delete');
    fireEvent.click(res);
    await wait();
    expect(gmp.agentgroup.delete).toHaveBeenCalled();

    expect(gmp.agentgroup.delete).toHaveBeenCalledWith(
      expect.objectContaining({id: 'g1'}),
      expect.anything(),
    );
  });
});
