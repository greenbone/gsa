/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import Target from 'gmp/models/target';
import {createSession} from 'gmp/testing';
import {
  useCloneTarget,
  useDeleteTarget,
  useGetTarget,
} from 'web/hooks/use-query/target';

const target = new Target({id: 'target-1', name: 'Target 1'});

const createGmp = ({token}: {token?: string} = {token: 'test-token'}) => ({
  session: createSession({token}),
  settings: {},
  target: {
    get: testing.fn().mockResolvedValue({data: target}),
    clone: testing.fn().mockResolvedValue({data: {id: 'target-2'}}),
    delete: testing.fn().mockResolvedValue(undefined),
  },
});

describe('useGetTarget', () => {
  test('should fetch a target by ID', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetTarget({id: target.id});
      return <div data-testid="target">{data?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('target')).toHaveTextContent('Target 1');
    });

    expect(gmp.target.get).toHaveBeenCalledWith({id: target.id});
  });

  test('should not fetch when the ID is empty', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetTarget({id: ''});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.target.get).not.toHaveBeenCalled();
  });

  test('should not fetch without a session token', () => {
    const gmp = createGmp({token: undefined});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetTarget({id: target.id});
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.target.get).not.toHaveBeenCalled();
  });

  test('should show an error when fetching a target fails', async () => {
    const gmp = createGmp();
    gmp.target.get.mockRejectedValue(new Error('Request failed'));
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {isError} = useGetTarget({id: target.id});
      return <div data-testid="error">{isError ? 'Error' : ''}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Error');
    });
  });
});

describe('useCloneTarget', () => {
  test('should clone a target with its name and call onSuccess', async () => {
    const gmp = createGmp();
    const onSuccess = testing.fn();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCloneTarget({onSuccess});
      return (
        <button
          onClick={() =>
            mutation.mutate({id: 'target-1', name: 'Cloned Target'})
          }
        >
          Clone
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Clone'}));

    await waitFor(() => {
      expect(gmp.target.clone).toHaveBeenCalledWith({
        id: 'target-1',
      });
      expect(onSuccess).toHaveBeenCalledWith({id: 'target-2'});
      expect(
        screen.getByText('Target Cloned Target cloned successfully'),
      ).toBeInTheDocument();
    });
  });

  test('should call onError when cloning a target fails', async () => {
    const error = new Error('Clone failed');
    const gmp = createGmp();
    gmp.target.clone.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useCloneTarget({onError});
      return (
        <button
          onClick={() =>
            mutation.mutate({id: 'target-1', name: 'Cloned Target'})
          }
        >
          Clone
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Clone'}));

    await waitFor(() => expect(onError.mock.calls[0][0]).toBe(error));
  });
});

describe('useDeleteTarget', () => {
  test('should delete a target with its name and call onSuccess', async () => {
    const gmp = createGmp();
    const onSuccess = testing.fn();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useDeleteTarget({onSuccess});
      return (
        <button
          onClick={() =>
            mutation.mutate({id: 'target-1', name: 'Deleted Target'})
          }
        >
          Delete
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => {
      expect(gmp.target.delete).toHaveBeenCalledWith({
        id: 'target-1',
      });
      expect(onSuccess).toHaveBeenCalledWith(undefined);
      expect(
        screen.getByText('Target Deleted Target successfully deleted'),
      ).toBeInTheDocument();
    });
  });

  test('should call onError when deleting a target fails', async () => {
    const error = new Error('Delete failed');
    const gmp = createGmp();
    gmp.target.delete.mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const mutation = useDeleteTarget({onError});
      return (
        <button
          onClick={() =>
            mutation.mutate({id: 'target-1', name: 'Deleted Target'})
          }
        >
          Delete
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => expect(onError.mock.calls[0][0]).toBe(error));
  });
});
