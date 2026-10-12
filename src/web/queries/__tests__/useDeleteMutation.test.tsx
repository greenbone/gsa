/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import useDeleteMutation from 'web/queries/useDeleteMutation';

describe('useDeleteMutation', () => {
  test('should show a success message including the deleted entity name', async () => {
    const gmpMethod = testing.fn().mockResolvedValue(undefined);
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useDeleteMutation({
        gmpMethod,
        entityType: 'tag',
      });

      return (
        <button
          onClick={() => mutation.mutate({id: 'tag-1', name: 'Important Tag'})}
        >
          Delete
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => {
      expect(
        screen.getByText('Tag Important Tag successfully deleted'),
      ).toBeInTheDocument();
    });
  });

  test('should show a success message without an entity name', async () => {
    const gmpMethod = testing.fn().mockResolvedValue(undefined);
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useDeleteMutation({
        gmpMethod,
        entityType: 'tag',
      });

      return (
        <button onClick={() => mutation.mutate({id: 'tag-1', name: undefined})}>
          Delete
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => {
      expect(screen.getByText('Tag successfully deleted')).toBeInTheDocument();
    });
  });

  test('should call onSuccess when deleting an entity succeeds', async () => {
    const onSuccess = testing.fn();
    const gmpMethod = testing.fn().mockResolvedValue(undefined);
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useDeleteMutation({
        gmpMethod,
        entityType: 'tag',
        onSuccess,
      });

      return (
        <button
          onClick={() => mutation.mutate({id: 'tag-1', name: 'Important Tag'})}
        >
          Delete
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(undefined));
  });

  test('should call onError when deleting an entity fails', async () => {
    const error = new Error('Delete failed');
    const onError = testing.fn();
    const gmpMethod = testing.fn().mockRejectedValue(error);
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useDeleteMutation({
        gmpMethod,
        entityType: 'tag',
        onError,
      });

      return (
        <button
          onClick={() => mutation.mutate({id: 'tag-1', name: 'Important Tag'})}
        >
          Delete
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Delete'}));

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});
