/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, beforeEach} from '@gsa/testing';
import {screen, fireEvent, rendererWith, wait} from 'web/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import CvssV4Calculator from 'web/pages/extras/cvssV4/CvssV4Calculator';

const gmp = {
  user: {
    renewSession: testing.fn().mockResolvedValue({data: 123}),
  },
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
};

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

    render(<CvssV4Calculator />);

    const spanElement = screen.getByText(baseCVSSVector);
    expect(spanElement).toBeVisible();
  });

  test('Should render userVector from url', async () => {
    const cvssVector =
      'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N/CR:M/MSC:H';

    const {render} = rendererWith({
      gmp,
      store: true,
      router: true,
      route: `?cvssVector=${cvssVector}`,
    });

    render(<CvssV4Calculator />);

    const spanElement = screen.getByText(cvssVector);
    expect(spanElement).toBeVisible();
  });

  test('Changing userVector should change displayed select values', async () => {
    const {render} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    const {element} = render(<CvssV4Calculator />);

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

    const spanElement = screen.getByText(modifiedVectorInput);
    expect(spanElement).toBeVisible();

    const hiddenInput = element.querySelector(
      'input[name="AV"][type="hidden"]',
    );
    expect(hiddenInput).toHaveValue('P');
  });

  test('Changing displayed select values should change userVector', async () => {
    const {render} = rendererWith({
      gmp,
      store: true,
      router: true,
    });

    const {element} = render(<CvssV4Calculator location={location} />);

    const allSelectors = screen.getAllByTestId('form-select');
    const firstSelector = allSelectors[0];
    fireEvent.click(firstSelector);

    const option = screen.getByRole('option', {name: 'Local (L)'});
    fireEvent.click(option);

    const cvssVector =
      'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N';
    const input = element.querySelector('input[name="cvssVectorInput"]');
    expect(input).toHaveAttribute('value', cvssVector);
  });
});
