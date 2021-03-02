/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

import {fireEvent, rendererWith, waitFor, wait} from 'web/utils/testing';

import CvssCalculator from 'web/pages/extras/cvsscalculatorpage';

const location = {
  query: {cvssVector: 'AV:N/AC:L/Au:N/C:P/I:P/A:P'},
};

const renewDate = '2019-10-10T12:00:00Z';

let gmp;
let queryMock;

beforeEach(() => {
  [queryMock] = createRenewSessionQueryMock(renewDate);

  const renewSession = jest.fn().mockResolvedValue({data: renewDate});
  const calculateScoreFromVector = jest.fn().mockReturnValue(
    Promise.resolve({
      data: 7.5,
    }),
  );

  gmp = {
    cvsscalculator: {
      calculateScoreFromVector,
    },
    settings: {
      manualUrl: 'http://docs.greenbone.net/GSM-Manual/gos-5/',
    },
    user: {
      renewSession,
    },
  };
});

describe('CvssCalculator page tests', () => {
  test('Should render with default values', () => {
    const {render} = rendererWith({
      gmp,
      store: true,
      queryMocks: [queryMock],
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
    const {render} = rendererWith({
      gmp,
      store: true,
      queryMocks: [queryMock],
    });

    const {element, getAllByTestId} = render(
      <CvssCalculator location={location} />,
    );

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
      queryMocks: [queryMock],
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
    const {render} = rendererWith({
      gmp,
      store: true,
      queryMocks: [queryMock],
    });

    const {element, getAllByTestId} = render(
      <CvssCalculator location={location} />,
    );

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
