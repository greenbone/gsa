/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {userEvent, rendererWith, waitFor} from 'web/utils/testing';

import TrashcanPage from 'web/pages/extras/trashcanpage';
import Capabilities from 'gmp/capabilities/capabilities';

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
        data: [],
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

describe('Trashcan page tests', () => {
  test('Should render with empty trashcan button and empty out trash', async () => {
    const {render} = rendererWith({
      gmp,
      capabilities,
      store: true,
    });

    const {getByText, queryByTestId, getByRole} = render(<TrashcanPage />);
    expect(queryByTestId('loading')).toBeVisible();
    await waitFor(() => {
      expect(queryByTestId('loading')).not.toBeInTheDocument();
    });
    const emptyTrashcanButton = getByRole('button', {
      name: /Empty Trash/i,
    });

    userEvent.click(emptyTrashcanButton);
    await waitFor(() => {
      expect(
        getByText('Are you sure you want to empty the trash?'),
      ).toBeVisible();
    });

    const confirmButton = getByRole('button', {name: /Confirm/i});

    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(gmp.trashcan.empty).toHaveBeenCalled();
    });

    testing.advanceTimersByTime(1000);

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

    const {getByText, queryByTestId, getByRole} = render(<TrashcanPage />);
    expect(queryByTestId('loading')).toBeVisible();
    await waitFor(() => {
      expect(queryByTestId('loading')).not.toBeInTheDocument();
    });
    const emptyTrashcanButton = getByRole('button', {
      name: /Empty Trash/i,
    });

    userEvent.click(emptyTrashcanButton);
    await waitFor(() => {
      expect(
        getByText('Are you sure you want to empty the trash?'),
      ).toBeVisible();
    });

    const confirmButton = getByRole('button', {name: /Confirm/i});

    await userEvent.click(confirmButton);

    expect(errorGmp.trashcan.empty).toHaveBeenCalled();

    expect(
      getByText(
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

    const {getByText, queryByTestId, getByRole} = render(<TrashcanPage />);
    expect(queryByTestId('loading')).toBeVisible();
    await waitFor(() => {
      expect(queryByTestId('loading')).not.toBeInTheDocument();
    });
    const emptyTrashcanButton = getByRole('button', {
      name: /Empty Trash/i,
    });

    await userEvent.click(emptyTrashcanButton);

    expect(
      getByText('Are you sure you want to empty the trash?'),
    ).toBeVisible();

    const cancelButton = getByRole('button', {name: /Cancel/i});

    await userEvent.click(cancelButton);

    expect(cancelButton).not.toBeVisible();
  });
});
