/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import TrashcanPage from 'web/pages/extras/TrashCanPage';
import {screen, rendererWith, waitFor, fireEvent, wait} from 'web/testing';

/*
 * The following is a workaround for userEvent v14 and fake timers https://github.com/testing-library/react-testing-library/issues/1197
 */

testing.useFakeTimers({
  shouldAdvanceTime: true,
});

const gmp = {
  trashcan: {
    empty: testing.fn().mockResolvedValueOnce(),
    get: testing.fn().mockReturnValue(
      Promise.resolve({
        data: {},
      }),
    ),
  },
  settings: {
    manualUrl: 'http://docs.greenbone.net/GSM-Manual/gos-5/',
  },
  user: {
    renewSession: testing.fn().mockReturnValue(
      Promise.resolve({
        data: 'foo',
      }),
    ),
  },
};

const capabilities = new Capabilities(['everything']);

describe('TrashCan page tests', () => {
  test('Should render with empty trashcan button and empty out trash', async () => {
    const {render} = rendererWith({
      gmp,
      capabilities,
      store: true,
    });

    render(<TrashcanPage />);

    expect(screen.queryByTestId('loading')).toBeVisible();
    await wait();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    const emptyTrashcanButton = screen.getByRole('button', {
      name: /Empty Trash/i,
    });

    fireEvent.click(emptyTrashcanButton);
    await wait();
    expect(
      screen.getByText('Are you sure you want to empty the trash?'),
    ).toBeVisible();

    const confirmButton = screen.getByRole('button', {name: /Confirm/i});
    fireEvent.click(confirmButton);
    expect(gmp.trashcan.empty).toHaveBeenCalled();

    await wait();

    await waitFor(() => {
      expect(confirmButton).not.toBeVisible();
    });
  });

  test('Should render with empty trashcan button and handle error case', async () => {
    const errorGmp = {
      ...gmp,
      trashcan: {
        ...gmp.trashcan,
        empty: testing
          .fn()
          .mockRejectedValue(new Error('Failed to empty trash')),
      },
    };
    const {render} = rendererWith({
      gmp: errorGmp,
      capabilities,
      store: true,
    });

    render(<TrashcanPage />);
    expect(screen.queryByTestId('loading')).toBeVisible();

    await wait();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    const emptyTrashcanButton = screen.getByRole('button', {
      name: /Empty Trash/i,
    });

    fireEvent.click(emptyTrashcanButton);
    await wait();
    expect(
      screen.getByText('Are you sure you want to empty the trash?'),
    ).toBeVisible();

    const confirmButton = screen.getByRole('button', {name: /Confirm/i});
    fireEvent.click(confirmButton);
    expect(errorGmp.trashcan.empty).toHaveBeenCalled();
    await wait();
    expect(
      screen.getByText(
        'An error occurred while emptying the trash, please try again.',
      ),
    ).toBeVisible();
  });

  test('Should render open and close dialog', async () => {
    const {render} = rendererWith({
      gmp,
      capabilities,
      store: true,
    });

    render(<TrashcanPage />);
    expect(screen.queryByTestId('loading')).toBeVisible();
    await wait();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    const emptyTrashcanButton = screen.getByRole('button', {
      name: /Empty Trash/i,
    });

    fireEvent.click(emptyTrashcanButton);
    expect(
      screen.getByText('Are you sure you want to empty the trash?'),
    ).toBeVisible();

    const cancelButton = screen.getByRole('button', {name: /Cancel/i});
    fireEvent.click(cancelButton);
    expect(cancelButton).not.toBeVisible();
  });
});
