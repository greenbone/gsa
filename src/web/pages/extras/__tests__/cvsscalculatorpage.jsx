/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, beforeEach} from '@gsa/testing';

import {fireEvent, rendererWith, waitFor, wait} from 'web/utils/testing';

import CvssCalculator from 'web/pages/extras/cvsscalculatorpage';

const calculateScoreFromVector = testing.fn().mockReturnValue(
  Promise.resolve({
    data: 7.5,
  }),
);

const gmp = {
  cvsscalculator: {
    calculateScoreFromVector,
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

const location = {
  query: {cvssVector: 'AV:N/AC:L/Au:N/C:P/I:P/A:P'},
};

describe('CvssCalculator page tests', () => {
  beforeEach(() => {
    window.history.pushState({}, 'Test Title', '/');
  });
  test('Should render with default values', () => {
    const {render} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    const {element, getAllByTestId} = render(<CvssCalculator />);

    const input = getAllByTestId('select-selected-value');

    waitFor(() => element.querySelectorAll('input'));
    const vector = element.querySelectorAll('input');

    /* CVSSv2 input */
    expect(input[0]).toHaveTextContent('Local');
    expect(input[1]).toHaveTextContent('Low');
    expect(input[2]).toHaveTextContent('None');
    expect(input[3]).toHaveTextContent('None');
    expect(input[4]).toHaveTextContent('None');
    expect(input[5]).toHaveTextContent('None');
    /* CVSSv3 input */
    expect(input[6]).toHaveTextContent('Network');
    expect(input[7]).toHaveTextContent('Low');
    expect(input[8]).toHaveTextContent('None');
    expect(input[9]).toHaveTextContent('None');
    expect(input[10]).toHaveTextContent('Unchanged');
    expect(input[11]).toHaveTextContent('None');
    expect(input[12]).toHaveTextContent('None');
    expect(input[13]).toHaveTextContent('None');

    expect(vector[0]).toHaveAttribute('value', 'AV:L/AC:L/Au:N/C:N/I:N/A:N');
    expect(vector[1]).toHaveAttribute(
      'value',
      'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N',
    );
  });

  test('Should render userVector from url', async () => {
    window.history.pushState(
      {},
      'Test Title',
      `?cvssVector=AV:N/AC:L/Au:N/C:P/I:P/A:P`,
    );

    const {render} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    const {element, getAllByTestId} = render(<CvssCalculator />);

    await wait();

    const input = getAllByTestId('select-selected-value');
    const vector = element.querySelectorAll('input');

    /* CVSSv2 input */
    expect(input[0]).toHaveTextContent('Network');
    expect(input[1]).toHaveTextContent('Low');
    expect(input[2]).toHaveTextContent('None');
    expect(input[3]).toHaveTextContent('Partial');
    expect(input[4]).toHaveTextContent('Partial');
    expect(input[5]).toHaveTextContent('Partial');
    /* CVSSv3 input */
    expect(input[6]).toHaveTextContent('Network');
    expect(input[7]).toHaveTextContent('Low');
    expect(input[8]).toHaveTextContent('None');
    expect(input[9]).toHaveTextContent('None');
    expect(input[10]).toHaveTextContent('Unchanged');
    expect(input[11]).toHaveTextContent('None');
    expect(input[12]).toHaveTextContent('None');
    expect(input[13]).toHaveTextContent('None');

    expect(vector[0]).toHaveAttribute('value', 'AV:N/AC:L/Au:N/C:P/I:P/A:P');
    expect(vector[1]).toHaveAttribute(
      'value',
      'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N',
    );
  });

  test('Changing userVector should change displayed select values', async () => {
    const {render} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    const {element, getAllByTestId} = render(
      <CvssCalculator location={location} />,
    );

    await wait();

    const vector = element.querySelectorAll('input');

    fireEvent.change(vector[0], {
      target: {value: 'AV:N/AC:L/Au:N/C:N/I:P/A:P'},
    });

    fireEvent.change(vector[1], {
      target: {value: 'CVSS:3.1/AV:P/AC:H/PR:L/UI:R/S:C/C:H/I:H/A:H'},
    });

    await wait();

    const input = getAllByTestId('select-selected-value');

    /* CVSSv2 input */
    expect(input[0]).toHaveTextContent('Network');
    expect(input[1]).toHaveTextContent('Low');
    expect(input[2]).toHaveTextContent('None');
    expect(input[3]).toHaveTextContent('None');
    expect(input[4]).toHaveTextContent('Partial');
    expect(input[5]).toHaveTextContent('Partial');
    /* CVSSv3 input */
    expect(input[6]).toHaveTextContent('Physical');
    expect(input[7]).toHaveTextContent('High');
    expect(input[8]).toHaveTextContent('Low');
    expect(input[9]).toHaveTextContent('Required');
    expect(input[10]).toHaveTextContent('Changed');
    expect(input[11]).toHaveTextContent('High');
    expect(input[12]).toHaveTextContent('High');
    expect(input[13]).toHaveTextContent('High');

    expect(vector[0]).toHaveAttribute('value', 'AV:N/AC:L/Au:N/C:N/I:P/A:P');
    expect(vector[1]).toHaveAttribute(
      'value',
      'CVSS:3.1/AV:P/AC:H/PR:L/UI:R/S:C/C:H/I:H/A:H',
    );
  });

  test('Changing displayed select values should change userVector', async () => {
    window.history.pushState(
      {},
      'Test Title',
      `?cvssVector=AV:N/AC:L/Au:N/C:P/I:P/A:P`,
    );

    const {render} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    const {element, getAllByTestId} = render(<CvssCalculator />);

    await wait();

    const vector = element.querySelectorAll('input');

    const input = getAllByTestId('select-selected-value');

    /* CVSSv2 input */
    expect(input[0]).toHaveTextContent('Network');
    expect(input[1]).toHaveTextContent('Low');
    expect(input[2]).toHaveTextContent('None');
    expect(input[3]).toHaveTextContent('Partial');
    expect(input[4]).toHaveTextContent('Partial');
    expect(input[5]).toHaveTextContent('Partial');
    /* CVSSv3 input */
    expect(input[6]).toHaveTextContent('Network');
    expect(input[7]).toHaveTextContent('Low');
    expect(input[8]).toHaveTextContent('None');
    expect(input[9]).toHaveTextContent('None');
    expect(input[10]).toHaveTextContent('Unchanged');
    expect(input[11]).toHaveTextContent('None');
    expect(input[12]).toHaveTextContent('None');
    expect(input[13]).toHaveTextContent('None');

    expect(vector[0]).toHaveAttribute('value', 'AV:N/AC:L/Au:N/C:P/I:P/A:P');
    expect(vector[1]).toHaveAttribute(
      'value',
      'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N',
    );

    const selectFields = getAllByTestId('select-open-button');

    fireEvent.click(selectFields[0]);

    const selectItems = getAllByTestId('select-item');

    fireEvent.click(selectItems[0]);

    const selectFields2 = getAllByTestId('select-open-button');

    fireEvent.click(selectFields2[7]);

    const selectItems2 = getAllByTestId('select-item');

    fireEvent.click(selectItems2[1]);

    expect(vector[0]).toHaveAttribute('value', 'AV:L/AC:L/Au:N/C:P/I:P/A:P');
    expect(vector[1]).toHaveAttribute(
      'value',
      'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:N',
    );
  });
});
