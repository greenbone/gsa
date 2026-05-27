/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import Agent from 'gmp/models/agent';
import {createSession} from 'gmp/testing';
import AgentComponent from 'web/pages/agents/AgentComponent';

type AgentActions = {
  delete: (entity: Agent) => Promise<void>;
  edit: (entity: Agent) => void;
  authorize: (entity: Agent) => Promise<void>;
};

const sampleAgent: Agent = new Agent({
  id: 'a1',
  name: 'agent1',
  authorized: true,
});

const sampleUnauthorizedAgent: Agent = new Agent({
  id: 'a3',
  name: 'agent3',
  authorized: false,
});

const sampleAgentWithUpdateToLatest: Agent = new Agent({
  id: 'a2',
  name: 'agent2',
  authorized: true,
  updateToLatest: true,
});

const createGmp = ({
  save = testing.fn().mockResolvedValue(undefined),
  delete: deleteMock = testing.fn().mockResolvedValue(undefined),
} = {}) => ({
  session: createSession(),
  agent: {
    save,
    delete: deleteMock,
  },
});

describe('AgentComponent tests', () => {
  test('should open dialog for edit and call save mutation', async () => {
    const onSaved = testing.fn();
    const saveMock = testing.fn().mockResolvedValue(undefined);
    const gmp = createGmp({save: saveMock});

    let actions: AgentActions | undefined;
    const {render} = rendererWith({gmp});

    render(
      <AgentComponent onSaved={onSaved}>
        {(props: AgentActions) => {
          actions = props;
          return <div />;
        }}
      </AgentComponent>,
    );

    actions?.edit(sampleAgent);

    await wait();

    expect(screen.getByText('Edit Agent - agent1')).toBeInTheDocument();

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    await wait();

    expect(saveMock).toHaveBeenCalled();
    expect(saveMock.mock.calls[0][0]).toEqual({
      agentsIds: ['a1'],
      authorized: true,
      updateToLatest: false,
      intervalInSeconds: 300,
      comment: undefined,
    });
    expect(onSaved).toHaveBeenCalled();
  });

  test('should handle delete action', async () => {
    const onDeleted = testing.fn();
    const deleteMock = testing.fn().mockResolvedValue(undefined);
    const gmp = createGmp({delete: deleteMock});

    let actions: AgentActions | undefined;
    const {render} = rendererWith({gmp});

    render(
      <AgentComponent onDeleted={onDeleted}>
        {(props: AgentActions) => {
          actions = props;
          return <div />;
        }}
      </AgentComponent>,
    );

    await actions?.delete(sampleAgent);

    expect(deleteMock).toHaveBeenCalledWith({id: 'a1'});
    expect(onDeleted).toHaveBeenCalled();
  });

  test('should handle authorize action', async () => {
    const onSaved = testing.fn();
    const saveMock = testing.fn().mockResolvedValue(undefined);
    const gmp = createGmp({save: saveMock});

    let actions: AgentActions | undefined;
    const {render} = rendererWith({gmp});

    render(
      <AgentComponent onSaved={onSaved}>
        {(props: AgentActions) => {
          actions = props;
          return <div />;
        }}
      </AgentComponent>,
    );

    await actions?.authorize(sampleAgent);

    expect(saveMock).toHaveBeenCalled();
    expect(saveMock.mock.calls[0][0]).toEqual({
      agentsIds: ['a1'],
      authorized: false,
    });
    expect(onSaved).toHaveBeenCalled();
  });

  test('should handle authorize action for unauthorized agent', async () => {
    const onSaved = testing.fn();
    const saveMock = testing.fn().mockResolvedValue(undefined);
    const gmp = createGmp({save: saveMock});

    let actions: AgentActions | undefined;
    const {render} = rendererWith({gmp});

    render(
      <AgentComponent onSaved={onSaved}>
        {(props: AgentActions) => {
          actions = props;
          return <div />;
        }}
      </AgentComponent>,
    );

    await actions?.authorize(sampleUnauthorizedAgent);

    expect(saveMock).toHaveBeenCalled();
    expect(saveMock.mock.calls[0][0]).toEqual({
      agentsIds: ['a3'],
      authorized: true,
    });
    expect(onSaved).toHaveBeenCalled();
  });

  test('should handle delete error', async () => {
    const onDeleteError = testing.fn();
    const deleteError = new Error('Delete failed');
    const deleteMock = testing.fn().mockRejectedValue(deleteError);

    const gmp = createGmp({delete: deleteMock});

    let actions: AgentActions | undefined;
    const {render} = rendererWith({gmp});

    render(
      <AgentComponent onDeleteError={onDeleteError}>
        {(props: AgentActions) => {
          actions = props;
          return <div />;
        }}
      </AgentComponent>,
    );

    await expect(actions?.delete(sampleAgent)).rejects.toThrow('Delete failed');

    expect(deleteMock).toHaveBeenCalledWith({id: 'a1'});
    expect(onDeleteError).toHaveBeenCalled();
  });

  test('should handle save error', async () => {
    const onSaveError = testing.fn();
    const saveError = new Error('Save failed');
    const saveMock = testing.fn().mockRejectedValue(saveError);

    const gmp = createGmp({save: saveMock});

    let actions: AgentActions | undefined;
    const {render} = rendererWith({gmp});

    render(
      <AgentComponent onSaveError={onSaveError}>
        {(props: AgentActions) => {
          actions = props;
          return <div />;
        }}
      </AgentComponent>,
    );

    await expect(actions?.authorize(sampleAgent)).rejects.toThrow(
      'Save failed',
    );

    expect(saveMock).toHaveBeenCalled();
    expect(saveMock.mock.calls[0][0]).toEqual({
      agentsIds: ['a1'],
      authorized: false,
    });
    expect(onSaveError).toHaveBeenCalled();
  });

  test('should handle edit dialog with updateToLatest and save correctly', async () => {
    const onSaved = testing.fn();
    const saveMock = testing.fn().mockResolvedValue(undefined);
    const gmp = createGmp({save: saveMock});

    let actions: AgentActions | undefined;
    const {render} = rendererWith({gmp});

    render(
      <AgentComponent onSaved={onSaved}>
        {(props: AgentActions) => {
          actions = props;
          return <div />;
        }}
      </AgentComponent>,
    );

    actions?.edit(sampleAgentWithUpdateToLatest);

    await wait();

    expect(screen.getByText('Edit Agent - agent2')).toBeInTheDocument();
    expect(screen.getByText('Automatic Update Settings')).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', {
      name: 'Enable automatic updates',
    });

    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();

    const save = screen.getDialogSaveButton();
    fireEvent.click(save);

    await wait();

    expect(saveMock).toHaveBeenCalled();
    expect(saveMock.mock.calls[0][0]).toEqual({
      agentsIds: ['a2'],
      authorized: true,
      updateToLatest: true,
      intervalInSeconds: 300,
      comment: undefined,
    });
    expect(onSaved).toHaveBeenCalled();
  });

  test('should pass updateToLatest false to AgentDialog when editing agent', async () => {
    const onSaved = testing.fn();
    const gmp = createGmp();

    let actions: AgentActions | undefined;
    const {render} = rendererWith({gmp});

    render(
      <AgentComponent onSaved={onSaved}>
        {(props: AgentActions) => {
          actions = props;
          return <div />;
        }}
      </AgentComponent>,
    );

    actions?.edit(sampleAgent);

    await wait();

    const checkbox = screen.getByRole('checkbox', {
      name: 'Enable automatic updates',
    });

    expect(checkbox).not.toBeChecked();
  });
});
