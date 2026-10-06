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
      expect(gmp.agentgroup.create.mock.calls[0][0]).toEqual(input);
    });
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
      expect(gmp.agentgroup.save.mock.calls[0][0]).toEqual(input);
    });
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
});
