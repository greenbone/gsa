/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';
import {act} from 'react-dom/test-utils';

import {fireEvent, rendererWith, waitForElement} from 'web/utils/testing';

import CvssCalculator from 'web/pages/extras/cvsscalculatorpage';

const calculateScoreFromVector = jest.fn().mockReturnValue(
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
    renewSession: jest.fn().mockReturnValue(
      Promise.resolve({
        data: 'foo',
      }),
    ),
  },
};

const onInteraction = jest.fn();

const location = {
  query: {cvssVector: 'AV:N/AC:L/Au:N/C:P/I:P/A:P'},
};

describe('CvssCalculator page tests', () => {
  test('Should render with default values', () => {
    const {render} = rendererWith({
      gmp,
      onInteraction,
      store: true,
    });

    const {element, getAllByTestId} = render(<CvssCalculator />);

    expect(element).toMatchSnapshot();
    const input = getAllByTestId('select-selected-value');
    waitForElement(() => element.querySelectorAll('input'));
    const vector = element.querySelectorAll('input');

    act(() => {
      expect(input[0]).toHaveTextContent('Local');
      expect(input[1]).toHaveTextContent('Low');
      expect(input[2]).toHaveTextContent('None');
      expect(input[3]).toHaveTextContent('None');
      expect(input[4]).toHaveTextContent('None');
      expect(input[5]).toHaveTextContent('None');

      expect(vector[0]).toHaveAttribute('value', 'AV:L/AC:L/Au:N/C:N/I:N/A:N');
    });
  });
  test('Should render userVector from url', () => {
    const {render} = rendererWith({
      gmp,
      onInteraction,
      store: true,
    });

    const {element, getAllByTestId} = render(
      <CvssCalculator location={location} />,
    );

    const input = getAllByTestId('select-selected-value');
    const vector = element.querySelectorAll('input');

    act(() => {
      expect(input[0]).toHaveTextContent('Network');
      expect(input[1]).toHaveTextContent('Low');
      expect(input[2]).toHaveTextContent('None');
      expect(input[3]).toHaveTextContent('Partial');
      expect(input[4]).toHaveTextContent('Partial');
      expect(input[5]).toHaveTextContent('Partial');

      expect(vector[0]).toHaveAttribute('value', 'AV:N/AC:L/Au:N/C:P/I:P/A:P');
    });
  });
  test('Changing userVector should change displayed select values', () => {
    const {render} = rendererWith({
      gmp,
      onInteraction,
      store: true,
    });

    const {element, getAllByTestId} = render(
      <CvssCalculator location={location} />,
    );

    const vector = element.querySelectorAll('input');

    fireEvent.change(vector[0], {
      target: {value: 'AV:N/AC:L/Au:N/C:N/I:P/A:P'},
    });

    const input = getAllByTestId('select-selected-value');

    act(() => {
      expect(input[0]).toHaveTextContent('Network');
      expect(input[1]).toHaveTextContent('Low');
      expect(input[2]).toHaveTextContent('None');
      expect(input[3]).toHaveTextContent('None');
      expect(input[4]).toHaveTextContent('Partial');
      expect(input[5]).toHaveTextContent('Partial');

      expect(vector[0]).toHaveAttribute('value', 'AV:N/AC:L/Au:N/C:N/I:P/A:P');
    });
  });
  test('Changing displayed select values should change userVector', async () => {
    const {render} = rendererWith({
      gmp,
      onInteraction,
      store: true,
    });

    const {element, getAllByTestId} = render(
      <CvssCalculator location={location} />,
    );

    const vector = element.querySelectorAll('input');

    const input = getAllByTestId('select-selected-value');

    act(() => {
      expect(input[0]).toHaveTextContent('Network');
      expect(input[1]).toHaveTextContent('Low');
      expect(input[2]).toHaveTextContent('None');
      expect(input[3]).toHaveTextContent('Partial');
      expect(input[4]).toHaveTextContent('Partial');
      expect(input[5]).toHaveTextContent('Partial');

      expect(vector[0]).toHaveAttribute('value', 'AV:N/AC:L/Au:N/C:P/I:P/A:P');
    });

    act(() => {
      const selectFields = getAllByTestId('select-open-button');

      fireEvent.click(selectFields[0]);
    });

    act(() => {
      const selectItems = getAllByTestId('select-item');

      fireEvent.click(selectItems[0]);
    });

    expect(vector[0]).toHaveAttribute('value', 'AV:L/AC:L/Au:N/C:P/I:P/A:P');
  });
});
