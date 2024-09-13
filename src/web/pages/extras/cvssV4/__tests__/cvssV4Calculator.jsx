/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, beforeEach} from '@gsa/testing';
import {fireEvent, rendererWith, wait} from 'web/utils/testing';
import CvssV4Calculator from 'web/pages/extras/cvssV4/CvssV4Calculator';

const gmp = {};

const baseCVSSVector =
  'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N';

describe('CvssV4Calculator page tests', () => {
  beforeEach(() => {
    window.history.pushState({}, 'Test Title', '/');
  });
  test('Should render with default values', async () => {
    const {render} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    const {getByText, within} = render(<CvssV4Calculator />);

    const cvssVectorEl = getByText('CVSS Base Vector');
    const spanElement = within(cvssVectorEl.parentElement).getByText(
      baseCVSSVector,
    );

    expect(spanElement).toBeVisible();
  });

  test('Should render userVector from url', async () => {
    const cvssVector =
      'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N/CR:M/MSC:H';

    window.history.pushState({}, 'Test Title', `?cvssVector=${cvssVector}`);

    const {render} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    const {getByText, within} = render(<CvssV4Calculator />);

    const cvssVectorEl = getByText('CVSS Base Vector');
    const spanElement = within(cvssVectorEl.parentElement).getByText(
      cvssVector,
    );

    expect(spanElement).toBeVisible();
  });

  test('Changing userVector should change displayed select values', async () => {
    const {render} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    const {getByText, within, element, getAllByTestId} = render(
      <CvssV4Calculator />,
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
      router: true,
    });

    const {element, getAllByTestId, getByText, within} = render(
      <CvssV4Calculator />,
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
