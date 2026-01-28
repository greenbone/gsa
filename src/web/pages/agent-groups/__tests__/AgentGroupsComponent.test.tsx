/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import {type EntityActionData} from 'gmp/commands/entity';
import Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fast-xml';
import AgentGroup from 'gmp/models/agent-group';
import Button from 'web/components/form/Button';
import AgentGroupsComponent from 'web/pages/agent-groups/AgentGroupsComponent';

const sampleAgentGroup: AgentGroup = new AgentGroup({id: 'g1', name: 'group1'});

const createMock = testing.fn().mockResolvedValue({id: '123'});
const cloneMock = testing.fn().mockResolvedValue({id: 'cloned'});
const deleteMock = testing.fn().mockResolvedValue(undefined);
const saveMock = testing.fn().mockResolvedValue(undefined);

const createGmp = () => ({
  settings: {token: 'token'},
  scanners: {get: testing.fn().mockResolvedValue(new Response([], {}))},
  agents: {get: testing.fn().mockResolvedValue(new Response([], {}))},
  agentgroup: {
    create: createMock,
    clone: cloneMock,
    delete: deleteMock,
    save: saveMock,
  },
});

describe('AgentGroupsComponent tests', () => {
  test('should open dialog for edit and call save mutation', async () => {
    const gmp = createGmp();

    type AgentGroupsActions = {
      create: () => void;
      clone: (entity: AgentGroup) => void;
      delete: (entity: AgentGroup) => Promise<void> | void;
      edit: (entity: AgentGroup) => void;
    };
    let actions: AgentGroupsActions | undefined;
    const {render} = rendererWith({gmp});

    render(
      <AgentGroupsComponent onSaved={saveMock}>
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
    expect(saveMock).toHaveBeenCalled();
  });

  test('clone and delete handlers call gmp methods', async () => {
    const gmp = createGmp();

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
    await wait();
    expect(gmp.agentgroup.clone).toHaveBeenCalledWith(
      {id: 'g1'},
      expect.anything(),
    );

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

  test('clone should trigger onCloned callback on success', async () => {
    const onCloned = testing.fn();
    const gmp = createGmp();

    const {render} = rendererWith({gmp});

    render(
      <AgentGroupsComponent onCloned={onCloned}>
        {({clone}) => (
          <Button data-testid="clone" onClick={() => clone(sampleAgentGroup)} />
        )}
      </AgentGroupsComponent>,
    );

    fireEvent.click(screen.getByTestId('clone'));
    await wait();

    expect(gmp.agentgroup.clone).toHaveBeenCalledWith(
      {id: 'g1'},
      expect.anything(),
    );
    expect(onCloned).toHaveBeenCalled();
  });

  test('clone should trigger onCloneError callback on failure', async () => {
    const onCloneError = testing.fn();
    const error = new Error('Clone operation failed');
    cloneMock.mockRejectedValue(error);
    const gmp = createGmp();

    const {render} = rendererWith({gmp});

    let cloneFn:
      | ((entity: AgentGroup) => Promise<Response<EntityActionData, XmlMeta>>)
      | undefined;
    render(
      <AgentGroupsComponent onCloneError={onCloneError}>
        {({clone}) => {
          cloneFn = clone;
          return <Button data-testid="clone" />;
        }}
      </AgentGroupsComponent>,
    );

    fireEvent.click(screen.getByTestId('clone'));
    // Catch the rejection to prevent unhandled promise rejection
    if (cloneFn) {
      await cloneFn(sampleAgentGroup).catch(() => {});
    }
    await wait();

    expect(gmp.agentgroup.clone).toHaveBeenCalledWith(
      {id: 'g1'},
      expect.anything(),
    );
    // React Query mutations pass additional context parameters to error callbacks
    expect(onCloneError).toHaveBeenCalled();
    expect(onCloneError.mock.calls[0][0]).toEqual(error);
  });

  test('delete should trigger onDeleted callback on success', async () => {
    const gmp = createGmp();

    const {render} = rendererWith({gmp});

    render(
      <AgentGroupsComponent onDeleted={deleteMock}>
        {({delete: del}) => (
          <Button data-testid="delete" onClick={() => del(sampleAgentGroup)} />
        )}
      </AgentGroupsComponent>,
    );

    fireEvent.click(screen.getByTestId('delete'));
    await wait();

    expect(gmp.agentgroup.delete).toHaveBeenCalled();
    expect(deleteMock).toHaveBeenCalled();
  });

  test('delete should trigger onDeleteError callback on failure', async () => {
    const onDeleteError = testing.fn();
    const error = new Error('Delete operation failed');
    deleteMock.mockRejectedValue(error);
    const gmp = createGmp();

    const {render} = rendererWith({gmp});

    let deleteFn: ((entity: AgentGroup) => Promise<void>) | undefined;
    render(
      <AgentGroupsComponent onDeleteError={onDeleteError}>
        {({delete: del}) => {
          deleteFn = del;
          return <Button data-testid="delete" />;
        }}
      </AgentGroupsComponent>,
    );

    fireEvent.click(screen.getByTestId('delete'));
    // Catch the rejection to prevent unhandled promise rejection
    if (deleteFn) {
      await deleteFn(sampleAgentGroup).catch(() => {});
    }
    await wait();

    expect(gmp.agentgroup.delete).toHaveBeenCalled();
    // React Query mutations pass additional context parameters to error callbacks
    expect(onDeleteError).toHaveBeenCalled();
    expect(onDeleteError.mock.calls[0][0]).toEqual(error);
  });
});
