/* Copyright (C) 2024 Greenbone AG
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

import {describe, test, expect} from '@gsa/testing';
import {fireEvent, rendererWith, wait} from 'web/utils/testing';
import CvssV4Point0Calculator from 'web/pages/extras/cvssV4Point0/CvssV4Point0Calculator';

const gmp = {};

const baseCVSSVector =
  'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N';

const location = {
  query: {
    cvssVector: baseCVSSVector,
  },
};

describe('CvssV4Point0Calculator page tests', () => {
  test('Should render with default values', async () => {
    const {render} = rendererWith({
      gmp,
      store: true,
    });

    const {getByText, within} = render(
      <CvssV4Point0Calculator location={location} />,
    );

    const cvssVectorEl = getByText('CVSS Base Vector');
    const spanElement = within(cvssVectorEl.parentElement).getByText(
      baseCVSSVector,
    );

    expect(spanElement).toBeVisible();
  });

  test('Should render userVector from url', async () => {
    const locationModified = {
      query: {
        cvssVector:
          'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N/CR:M/MSC:H',
      },
    };
    const {render} = rendererWith({
      gmp,
      store: true,
    });

    const {getByText, within} = render(
      <CvssV4Point0Calculator location={locationModified} />,
    );

    const cvssVectorEl = getByText('CVSS Base Vector');
    const spanElement = within(cvssVectorEl.parentElement).getByText(
      locationModified.query.cvssVector,
    );

    expect(spanElement).toBeVisible();
  });

  test('Changing userVector should change displayed select values', async () => {
    const {render} = rendererWith({
      gmp,
      store: true,
    });

    const {getByText, within, element, getAllByTestId} = render(
      <CvssV4Point0Calculator location={location} />,
    );

    await wait();

    const vectorInput = element.querySelector('input[name="cvssVectorInput"]');

    const modifiedVectorInput =
      'CVSS:4.0/AV:P/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N';

    fireEvent.change(vectorInput, {
      target: {
        value: modifiedVectorInput,
      },
    });

    await wait();

    const cvssVectorEl = getByText('CVSS Base Vector');
    const spanElement = within(cvssVectorEl.parentElement).getByText(
      modifiedVectorInput,
    );

    expect(spanElement).toBeVisible();

    const metricsSelectBox = getAllByTestId('select-selected-value');
    const avMetric = metricsSelectBox[0];
    expect(avMetric).toHaveTextContent('Physical (P)');
  });

  test('Changing displayed select values should change userVector', async () => {
    const {render} = rendererWith({
      gmp,
      store: true,
    });

    const {element, getAllByTestId, getByText, within} = render(
      <CvssV4Point0Calculator location={location} />,
    );

    await wait();
    const selectFields = getAllByTestId('select-open-button');

    fireEvent.click(selectFields[0]);
    const selectItems = getAllByTestId('select-item');
    const avMetrics = selectItems[2];
    fireEvent.click(avMetrics);

    await wait();

    const cvssVector =
      'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N';

    const input = element.querySelector('input[name="cvssVectorInput"]');
    expect(input).toHaveAttribute('value', cvssVector);

    const cvssVectorEl = getByText('CVSS Base Vector');
    const spanElement = within(cvssVectorEl.parentElement).getByText(
      cvssVector,
    );

    expect(spanElement).toBeVisible();
  });
});
