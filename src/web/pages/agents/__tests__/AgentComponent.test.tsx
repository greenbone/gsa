/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, wait} from 'web/testing';
import Agent from 'gmp/models/agent';
import AgentComponent from 'web/pages/agents/AgentComponent';

const sampleAgent: Agent = new Agent({
  id: 'a1',
  name: 'agent1',
  authorized: true,
});

const sampleAgentWithUpdateToLatest: Agent = new Agent({
  id: 'a2',
  name: 'agent2',
  authorized: true,
  updateToLatest: true,
});

describe('AgentComponent tests', () => {
  test('should open dialog for edit and call save mutation', async () => {
    const onSaved = testing.fn();

    const gmp = {
      settings: {token: 'token'},
      agent: {
        save: testing.fn().mockResolvedValue(undefined),
        delete: testing.fn().mockResolvedValue(undefined),
        modify: testing.fn().mockResolvedValue(undefined),
      },
    };

    type AgentActions = {
      delete: (entity: Agent) => Promise<void>;
      edit: (entity: Agent) => void;
      authorize: (entity: Agent) => Promise<void>;
    };
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
    expect(save).toBeInTheDocument();
  });

  test('should handle delete action', async () => {
    const onDeleted = testing.fn();
    const deleteMock = testing.fn().mockResolvedValue(undefined);

    const gmp = {
      settings: {token: 'token'},
      agent: {
        save: testing.fn().mockResolvedValue(undefined),
        delete: deleteMock,
        modify: testing.fn().mockResolvedValue(undefined),
      },
    };

    type AgentActions = {
      delete: (entity: Agent) => Promise<void>;
      edit: (entity: Agent) => void;
      authorize: (entity: Agent) => Promise<void>;
    };
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

    expect(deleteMock).toHaveBeenCalledWith({id: 'a1'}, expect.any(Object));
    expect(onDeleted).toHaveBeenCalled();
  });

  test('should handle authorize action', async () => {
    const onSaved = testing.fn();
    const modifyMock = testing.fn().mockResolvedValue(undefined);

    const gmp = {
      settings: {token: 'token'},
      agent: {
        save: testing.fn().mockResolvedValue(undefined),
        delete: testing.fn().mockResolvedValue(undefined),
        modify: modifyMock,
      },
    };

    type AgentActions = {
      delete: (entity: Agent) => Promise<void>;
      edit: (entity: Agent) => void;
      authorize: (entity: Agent) => Promise<void>;
    };
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

    expect(onSaved).toHaveBeenCalled();
  });

  test('should handle delete error', async () => {
    const onDeleteError = testing.fn();
    const deleteError = new Error('Delete failed');
    const deleteMock = testing.fn().mockRejectedValue(deleteError);

    const gmp = {
      settings: {token: 'token'},
      agent: {
        save: testing.fn().mockResolvedValue(undefined),
        delete: deleteMock,
        modify: testing.fn().mockResolvedValue(undefined),
      },
    };

    type AgentActions = {
      delete: (entity: Agent) => Promise<void>;
      edit: (entity: Agent) => void;
      authorize: (entity: Agent) => Promise<void>;
    };
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

    expect(onDeleteError).toHaveBeenCalled();
  });

  test('should handle edit dialog with updateToLatest and save correctly', async () => {
    const onSaved = testing.fn();
    const modifyMock = testing.fn().mockResolvedValue(undefined);

    const gmp = {
      settings: {token: 'token'},
      agent: {
        save: testing.fn().mockResolvedValue(undefined),
        delete: testing.fn().mockResolvedValue(undefined),
        modify: modifyMock,
      },
    };

    type AgentActions = {
      delete: (entity: Agent) => Promise<void>;
      edit: (entity: Agent) => void;
      authorize: (entity: Agent) => Promise<void>;
    };
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
    expect(save).toBeInTheDocument();
  });

  test('should pass updateToLatest to AgentDialog when editing agent', async () => {
    const onSaved = testing.fn();

    const gmp = {
      settings: {token: 'token'},
      agent: {
        save: testing.fn().mockResolvedValue(undefined),
        delete: testing.fn().mockResolvedValue(undefined),
        modify: testing.fn().mockResolvedValue(undefined),
      },
    };

    type AgentActions = {
      delete: (entity: Agent) => Promise<void>;
      edit: (entity: Agent) => void;
      authorize: (entity: Agent) => Promise<void>;
    };
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
