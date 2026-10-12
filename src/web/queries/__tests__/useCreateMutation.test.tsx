/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import useCreateMutation from 'web/queries/useCreateMutation';

describe('useCreateMutation', () => {
  test('should show a success message including the created entity name', async () => {
    const gmpMethod = testing.fn().mockResolvedValue({id: 'tag-1'});
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useCreateMutation({
        gmpMethod,
        entityType: 'tag',
      });

      return (
        <button onClick={() => mutation.mutate({name: 'Important Tag'})}>
          Create
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(
        screen.getByText('Tag Important Tag successfully created'),
      ).toBeInTheDocument();
    });
  });

  test('should show a success message without an entity name', async () => {
    const gmpMethod = testing.fn().mockResolvedValue({id: 'tag-1'});
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useCreateMutation({
        gmpMethod,
        entityType: 'tag',
      });

      return (
        <button onClick={() => mutation.mutate({name: undefined})}>
          Create
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => {
      expect(screen.getByText('Tag successfully created')).toBeInTheDocument();
    });
  });

  test('should call onSuccess with the created entity data', async () => {
    const createdEntity = {id: 'tag-1'};
    const gmpMethod = testing.fn().mockResolvedValue(createdEntity);
    const onSuccess = testing.fn();
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useCreateMutation({
        gmpMethod,
        entityType: 'tag',
        onSuccess,
      });

      return (
        <button onClick={() => mutation.mutate({name: 'Important Tag'})}>
          Create
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(createdEntity));
  });

  test('should call onError when creating an entity fails', async () => {
    const error = new Error('Create failed');
    const gmpMethod = testing.fn().mockRejectedValue(error);
    const onError = testing.fn();
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useCreateMutation({
        gmpMethod,
        entityType: 'tag',
        onError,
      });

      return (
        <button onClick={() => mutation.mutate({name: 'Important Tag'})}>
          Create
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Create'}));

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});
