/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import useCloneMutation from 'web/queries/useCloneMutation';

describe('useCloneMutation', () => {
  test('should show a success message including the cloned entity name', async () => {
    const gmpMethod = testing.fn().mockResolvedValue({id: 'tag-1'});
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useCloneMutation({
        gmpMethod,
        entityType: 'tag',
      });

      return (
        <button
          onClick={() => mutation.mutate({id: 'tag-1', name: 'Important Tag'})}
        >
          Clone
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Clone'}));

    await waitFor(() => {
      expect(
        screen.getByText('Tag Important Tag cloned successfully'),
      ).toBeInTheDocument();
    });
  });

  test('should show a success message without an entity name', async () => {
    const gmpMethod = testing.fn().mockResolvedValue({id: 'tag-1'});
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useCloneMutation({
        gmpMethod,
        entityType: 'tag',
      });

      return (
        <button onClick={() => mutation.mutate({id: 'tag-1', name: undefined})}>
          Clone
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Clone'}));

    await waitFor(() => {
      expect(screen.getByText('Tag cloned successfully')).toBeInTheDocument();
    });
  });

  test('should call onSuccess with the cloned entity data', async () => {
    const clonedEntity = {id: 'tag-1'};
    const gmpMethod = testing.fn().mockResolvedValue(clonedEntity);
    const onSuccess = testing.fn();
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useCloneMutation({
        gmpMethod,
        entityType: 'tag',
        onSuccess,
      });

      return (
        <button
          onClick={() => mutation.mutate({id: 'tag-1', name: 'Important Tag'})}
        >
          Clone
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Clone'}));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(clonedEntity));
  });

  test('should call onError when cloning an entity fails', async () => {
    const error = new Error('Clone failed');
    const gmpMethod = testing.fn().mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useCloneMutation({
        gmpMethod,
        entityType: 'tag',
        onError,
      });

      return (
        <button
          onClick={() => mutation.mutate({id: 'tag-1', name: 'Important Tag'})}
        >
          Clone
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Clone'}));

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});
