/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import {createSession} from 'gmp/testing';
import {
  useDeleteAgent,
  useDownloadAgentSupportBundle,
  useModifyAgent,
} from 'web/hooks/use-query/agent';

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  agent: {
    save: testing.fn().mockResolvedValue(undefined),
    delete: testing.fn().mockResolvedValue(undefined),
    downloadSupportBundle: testing
      .fn()
      .mockResolvedValue({data: new ArrayBuffer(0)}),
  },
});

describe('useModifyAgent', () => {
  test('should save an agent', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const input = {agentsIds: ['agent-1'], authorized: true};
    const TestComponent = () => {
      const mutation = useModifyAgent();
      return <button onClick={() => mutation.mutate(input)}>Save</button>;
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));
    await waitFor(() => {
      expect(gmp.agent.save).toHaveBeenCalledWith(input);
    });
  });

  test('should call onError when modifying an agent fails', async () => {
    const error = new Error('Modify failed');
    const gmp = createGmp();
    gmp.agent.save.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useModifyAgent({onError});
      return (
        <button onClick={() => mutation.mutate({agentsIds: ['agent-1']})}>
          Modify
        </button>
      );
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Modify'}));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});

describe('useDeleteAgent', () => {
  test('should delete an agent', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useDeleteAgent({});
      return (
        <button
          onClick={() =>
            mutation.mutate({
              id: 'agent-1',
              name: 'Deleted Agent',
            })
          }
        >
          Delete
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    await waitFor(() => {
      expect(gmp.agent.delete).toHaveBeenCalledWith({id: 'agent-1'});
    });
  });

  test('should call onError when deleting an agent fails', async () => {
    const error = new Error('Delete failed');
    const gmp = createGmp();
    gmp.agent.delete.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useDeleteAgent({onError});
      return (
        <button onClick={() => mutation.mutate({id: 'agent-1', name: 'Agent'})}>
          Delete
        </button>
      );
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});

describe('useDownloadAgentSupportBundle', () => {
  test('should download an agent support bundle', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useDownloadAgentSupportBundle();
      return (
        <button
          onClick={() => mutation.mutate({id: 'agent-1', encryption: false})}
        >
          Download
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Download'}));
    await waitFor(() => {
      expect(gmp.agent.downloadSupportBundle).toHaveBeenCalledWith(
        'agent-1',
        false,
      );
    });
  });

  test('should call onError when downloading an agent support bundle fails', async () => {
    const error = new Error('Download failed');
    const gmp = createGmp();
    gmp.agent.downloadSupportBundle.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});
    const TestComponent = () => {
      const mutation = useDownloadAgentSupportBundle({onError});
      return (
        <button
          onClick={() => mutation.mutate({id: 'agent-1', encryption: false})}
        >
          Download
        </button>
      );
    };
    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Download'}));
    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});
