/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import {createSession} from 'gmp/testing';
import {
  useCloneAgentGroup,
  useCreateAgentGroup,
  useDeleteAgentGroup,
  useSaveAgentGroup,
} from 'web/hooks/use-query/agent-group';

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  agentgroup: {
    create: testing.fn().mockResolvedValue({data: {id: 'group-2'}}),
    clone: testing.fn().mockResolvedValue({data: {id: 'group-2'}}),
    save: testing.fn().mockResolvedValue(undefined),
    delete: testing.fn().mockResolvedValue(undefined),
  },
});

describe('useCreateAgentGroup', () => {
  test('should create an agent group', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {name: 'New Group'};

    const TestComponent = () => {
      const mutation = useCreateAgentGroup({});
      return <button onClick={() => mutation.mutate(input)}>Run</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));

    await waitFor(() => {
      expect(gmp.agentgroup.create).toHaveBeenCalledWith(input);
    });
  });

  test('should call onError when creating an agent group fails', async () => {
    const error = new Error('Create failed');
    const gmp = createGmp();
    gmp.agentgroup.create.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useCreateAgentGroup({onError});
      return (
        <button onClick={() => mutation.mutate({name: 'Group'})}>Run</button>
      );
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});

describe('useCloneAgentGroup', () => {
  test('should clone an agent group', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {id: 'group-1', name: 'Cloned Group'};

    const TestComponent = () => {
      const mutation = useCloneAgentGroup({});
      return <button onClick={() => mutation.mutate(input)}>Run</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));

    await waitFor(() => {
      expect(gmp.agentgroup.clone).toHaveBeenCalledWith({id: 'group-1'});
    });
  });

  test('should call onError when cloning an agent group fails', async () => {
    const error = new Error('Clone failed');
    const gmp = createGmp();
    gmp.agentgroup.clone.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useCloneAgentGroup({onError});
      return (
        <button onClick={() => mutation.mutate({id: 'group-1', name: 'Group'})}>
          Run
        </button>
      );
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});

describe('useSaveAgentGroup', () => {
  test('should save an agent group', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {id: 'group-1', name: 'Saved Group'};

    const TestComponent = () => {
      const mutation = useSaveAgentGroup({});
      return <button onClick={() => mutation.mutate(input)}>Run</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));

    await waitFor(() => {
      expect(gmp.agentgroup.save).toHaveBeenCalledWith(input);
    });
  });

  test('should call onError when saving an agent group fails', async () => {
    const error = new Error('Save failed');
    const gmp = createGmp();
    gmp.agentgroup.save.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useSaveAgentGroup({onError});
      return (
        <button onClick={() => mutation.mutate({id: 'group-1', name: 'Group'})}>
          Run
        </button>
      );
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});

describe('useDeleteAgentGroup', () => {
  test('should delete an agent group', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {id: 'group-1', name: 'Deleted Group'};

    const TestComponent = () => {
      const mutation = useDeleteAgentGroup({});
      return <button onClick={() => mutation.mutate(input)}>Run</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));

    await waitFor(() => {
      expect(gmp.agentgroup.delete).toHaveBeenCalledWith({id: 'group-1'});
    });
  });

  test('should call onError when deleting an agent group fails', async () => {
    const error = new Error('Delete failed');
    const gmp = createGmp();
    gmp.agentgroup.delete.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useDeleteAgentGroup({onError});
      return (
        <button onClick={() => mutation.mutate({id: 'group-1', name: 'Group'})}>
          Run
        </button>
      );
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Run'}));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});
