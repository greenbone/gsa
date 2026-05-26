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
import {createSession} from 'gmp/testing';
import Button from 'web/components/form/Button';
import AgentGroupsComponent from 'web/pages/agent-groups/AgentGroupsComponent';

const sampleAgentGroup: AgentGroup = new AgentGroup({
  id: 'g1',
  name: 'group1',
});

const createGmp = () => {
  const createMock = testing.fn().mockResolvedValue({id: '123'});
  const cloneMock = testing.fn().mockResolvedValue({id: 'cloned'});
  const deleteMock = testing.fn().mockResolvedValue(undefined);
  const saveMock = testing.fn().mockResolvedValue(undefined);

  return {
    gmp: {
      settings: {},
      session: createSession({
        token: 'token',
      }),
      scanners: {get: testing.fn().mockResolvedValue(new Response([], {}))},
      agents: {get: testing.fn().mockResolvedValue(new Response([], {}))},
      agentgroup: {
        create: createMock,
        clone: cloneMock,
        delete: deleteMock,
        save: saveMock,
      },
    },
    createMock,
    cloneMock,
    deleteMock,
    saveMock,
  };
};

describe('AgentGroupsComponent tests', () => {
  test('should open dialog for edit and call save mutation', async () => {
    const {gmp, saveMock} = createGmp();

    type AgentGroupsActions = {
      create: () => void;
      clone: (
        entity: AgentGroup,
      ) => Promise<Response<EntityActionData, XmlMeta>>;
      delete: (entity: AgentGroup) => Promise<void>;
      edit: (entity: AgentGroup) => void;
    };

    let actions: AgentGroupsActions | undefined;
    const onSaved = testing.fn();
    const {render} = rendererWith({gmp});

    render(
      <AgentGroupsComponent onSaved={onSaved}>
        {(props: AgentGroupsActions) => {
          actions = props;
          return <div />;
        }}
      </AgentGroupsComponent>,
    );

    actions?.edit(sampleAgentGroup);
    await wait();

    const titleElement = screen.getDialogTitle();
    expect(titleElement).toHaveTextContent('Edit Agent Group');
    expect(titleElement).toHaveTextContent('group1');

    fireEvent.click(screen.getDialogSaveButton());

    await wait();

    expect(saveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'g1',
        name: 'group1',
        comment: '',
        scannerId: '',
        agentIds: [],
        schedulerCronTime: '0 */12 * * *',
      }),
      expect.anything(),
    );
    expect(onSaved).toHaveBeenCalled();
  });

  test('clone and delete handlers call gmp methods', async () => {
    const {gmp, cloneMock, deleteMock} = createGmp();
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

    expect(cloneMock).toHaveBeenCalledWith({
      id: 'g1',
    });

    fireEvent.click(screen.getByTestId('delete'));
    await wait();

    expect(deleteMock).toHaveBeenCalledWith({
      id: 'g1',
    });
  });

  test('clone should trigger onCloned callback on success', async () => {
    const {gmp, cloneMock} = createGmp();
    const onCloned = testing.fn();
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

    expect(cloneMock).toHaveBeenCalledWith({
      id: 'g1',
    });
    expect(onCloned).toHaveBeenCalled();
  });

  test('clone should trigger onCloneError callback on failure', async () => {
    const {gmp, cloneMock} = createGmp();
    const onCloneError = testing.fn();
    const error = new Error('Clone operation failed');

    cloneMock.mockRejectedValue(error);

    let cloneFn:
      | ((entity: AgentGroup) => Promise<Response<EntityActionData, XmlMeta>>)
      | undefined;

    const {render} = rendererWith({gmp});

    render(
      <AgentGroupsComponent onCloneError={onCloneError}>
        {({clone}) => {
          cloneFn = clone;
          return <Button data-testid="clone" />;
        }}
      </AgentGroupsComponent>,
    );

    await cloneFn?.(sampleAgentGroup).catch(() => {});
    await wait();

    expect(cloneMock).toHaveBeenCalledWith({
      id: 'g1',
    });
    expect(onCloneError).toHaveBeenCalled();
    expect(onCloneError.mock.calls[0][0]).toEqual(error);
  });

  test('delete should trigger onDeleted callback on success', async () => {
    const {gmp, deleteMock} = createGmp();
    const onDeleted = testing.fn();
    const {render} = rendererWith({gmp});

    render(
      <AgentGroupsComponent onDeleted={onDeleted}>
        {({delete: del}) => (
          <Button data-testid="delete" onClick={() => del(sampleAgentGroup)} />
        )}
      </AgentGroupsComponent>,
    );

    fireEvent.click(screen.getByTestId('delete'));
    await wait();

    expect(deleteMock).toHaveBeenCalledWith({
      id: 'g1',
    });
    expect(onDeleted).toHaveBeenCalled();
  });

  test('delete should trigger onDeleteError callback on failure', async () => {
    const {gmp, deleteMock} = createGmp();
    const onDeleteError = testing.fn();
    const error = new Error('Delete operation failed');

    deleteMock.mockRejectedValue(error);

    let deleteFn: ((entity: AgentGroup) => Promise<void>) | undefined;
    const {render} = rendererWith({gmp});

    render(
      <AgentGroupsComponent onDeleteError={onDeleteError}>
        {({delete: del}) => {
          deleteFn = del;
          return <Button data-testid="delete" />;
        }}
      </AgentGroupsComponent>,
    );

    await deleteFn?.(sampleAgentGroup).catch(() => {});
    await wait();

    expect(deleteMock).toHaveBeenCalledWith({
      id: 'g1',
    });
    expect(onDeleteError).toHaveBeenCalled();
    expect(onDeleteError.mock.calls[0][0]).toEqual(error);
  });
});
