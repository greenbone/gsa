/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  closeDialog,
  fireEvent,
  rendererWith,
  screen,
  waitFor,
} from 'web/testing';
import FeedKeyTab from 'web/pages/feed-configuration/tabs/FeedKeyTab';

const createGmp = (overrides: Record<string, unknown> = {}) => ({
  feedkey: {
    get: testing.fn().mockResolvedValue(null),
    delete: testing.fn().mockResolvedValue({status: 'success', message: 'ok'}),
    save: testing.fn().mockResolvedValue({status: 'success', message: 'ok'}),
  },
  settings: {
    jwt: 'test-jwt-token',
    manualUrl: 'http://foo.bar',
  },
  ...overrides,
});

describe('FeedKeyTab', () => {
  test('should show loading state initially', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<FeedKeyTab />);

    screen.getByTestId('loading');
  });

  test('should render no key state when no key data is returned', async () => {
    const gmp = createGmp({
      feedkey: {
        get: testing.fn().mockResolvedValue(null),
        delete: testing.fn(),
        save: testing.fn(),
      },
    });

    const {render} = rendererWith({gmp, router: true});
    render(<FeedKeyTab />);

    await screen.findByText('No Feed Key Configured');
    screen.getByText('Upload a feed key to enable', {exact: false});
    screen.getByText('Upload Key');
  });

  test('should render active key state when key data is returned', async () => {
    const gmp = createGmp({
      feedkey: {
        get: testing
          .fn()
          .mockResolvedValue({status: 'success', message: 'Key found'}),
        delete: testing.fn(),
        save: testing.fn(),
      },
    });

    const {render} = rendererWith({gmp, router: true});
    render(<FeedKeyTab />);

    await screen.findByText('Feed Key Active');
    screen.getByText('Your feed key is properly configured', {exact: false});
    screen.getByText('Delete Key');
  });

  test('should open upload dialog when Upload Key button is clicked', async () => {
    const gmp = createGmp({
      feedkey: {
        get: testing.fn().mockResolvedValue(null),
        delete: testing.fn(),
        save: testing.fn(),
      },
    });

    const {render} = rendererWith({gmp, router: true});
    render(<FeedKeyTab />);

    const uploadButton = await screen.findByText('Upload Key');
    fireEvent.click(uploadButton);

    screen.getByText('Upload Feed Key');
    screen.getByText('Please upload your feed key file', {exact: false});
  });

  test('should open delete confirmation dialog when Delete Key button is clicked', async () => {
    const gmp = createGmp({
      feedkey: {
        get: testing
          .fn()
          .mockResolvedValue({status: 'success', message: 'Key found'}),
        delete: testing.fn(),
        save: testing.fn(),
      },
    });

    const {render} = rendererWith({gmp, router: true});
    render(<FeedKeyTab />);

    const deleteButton = await screen.findByText('Delete Key');
    fireEvent.click(deleteButton);

    screen.getByText('Are you sure you want to delete', {exact: false});
  });

  test('should call delete mutation when confirming delete', async () => {
    const deleteFn = testing
      .fn()
      .mockResolvedValue({status: 'success', message: 'ok'});

    const gmp = createGmp({
      feedkey: {
        get: testing
          .fn()
          .mockResolvedValue({status: 'success', message: 'Key found'}),
        delete: deleteFn,
        save: testing.fn(),
      },
    });

    const {render} = rendererWith({gmp, router: true});
    render(<FeedKeyTab />);

    const deleteButton = await screen.findByText('Delete Key');
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByTestId('dialog-save-button');
    fireEvent.click(confirmButton);

    await waitFor(() => expect(deleteFn).toHaveBeenCalled());
  });

  test('should close confirmation dialog when cancelled', async () => {
    const gmp = createGmp({
      feedkey: {
        get: testing
          .fn()
          .mockResolvedValue({status: 'success', message: 'Key found'}),
        delete: testing.fn(),
        save: testing.fn(),
      },
    });

    const {render} = rendererWith({gmp, router: true});
    render(<FeedKeyTab />);

    const deleteButton = await screen.findByText('Delete Key');
    fireEvent.click(deleteButton);

    screen.getByText('Are you sure you want to delete', {exact: false});

    closeDialog();

    await waitFor(() =>
      expect(
        screen.queryByText('Are you sure you want to delete', {exact: false}),
      ).not.toBeInTheDocument(),
    );
  });

  test('should show no key state when there is an error fetching status', async () => {
    const gmp = createGmp({
      feedkey: {
        get: testing.fn().mockRejectedValue(new Error('Network error')),
        delete: testing.fn(),
        save: testing.fn(),
      },
    });

    const {render} = rendererWith({gmp, router: true});
    render(<FeedKeyTab />);

    await screen.findByText('No Feed Key Configured');
  });
});
