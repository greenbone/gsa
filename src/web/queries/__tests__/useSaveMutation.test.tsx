/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor} from 'web/testing';
import useSaveMutation from 'web/queries/useSaveMutation';

describe('useSaveMutation', () => {
  test('should show a success message including the saved entity name', async () => {
    const gmpMethod = testing.fn().mockResolvedValue(undefined);
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useSaveMutation({
        gmpMethod,
        entityType: 'tag',
      });

      return (
        <button onClick={() => mutation.mutate({name: 'Important Tag'})}>
          Save
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(
        screen.getByText('Tag Important Tag successfully saved'),
      ).toBeInTheDocument();
    });
  });

  test('should show a success message without an entity name', async () => {
    const gmpMethod = testing.fn().mockResolvedValue(undefined);
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useSaveMutation({
        gmpMethod,
        entityType: 'tag',
      });

      return (
        <button onClick={() => mutation.mutate({name: undefined})}>Save</button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(screen.getByText('Tag successfully saved')).toBeInTheDocument();
    });
  });

  test('should call onSuccess when saving an entity succeeds', async () => {
    const onSuccess = testing.fn();
    const gmpMethod = testing.fn().mockResolvedValue(undefined);
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useSaveMutation({
        gmpMethod,
        entityType: 'tag',
        onSuccess,
      });

      return (
        <button onClick={() => mutation.mutate({name: 'Important Tag'})}>
          Save
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(undefined));
  });

  test('should call onError when saving an entity fails', async () => {
    const error = new Error('Save failed');
    const onError = testing.fn();
    const gmpMethod = testing.fn().mockRejectedValue(error);
    const {render} = rendererWith({router: true});

    const TestComponent = () => {
      const mutation = useSaveMutation({
        gmpMethod,
        entityType: 'tag',
        onError,
      });

      return (
        <button onClick={() => mutation.mutate({name: 'Important Tag'})}>
          Save
        </button>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});
