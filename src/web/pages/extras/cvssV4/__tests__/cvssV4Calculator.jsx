/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing, beforeEach} from '@gsa/testing';
import {fireEvent, rendererWith, wait} from 'web/utils/testing';
import {
  clickElement,
  getSelectElements,
  getSelectItemElementsForSelect,
} from 'web/components/testing';
import CvssV4Calculator from 'web/pages/extras/cvssV4/CvssV4Calculator';

const gmp = {
  user: {
    renewSession: testing.fn().mockResolvedValue({data: 123}),
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

    const {getByText, within, element} = render(<CvssV4Calculator />);

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

    const sections = element.querySelectorAll('section');
    const cvssV2section = sections[0].parentNode;
    const cvssV2selects = getSelectElements(cvssV2section);
    const cvssV2items = await getSelectItemElementsForSelect(cvssV2selects[0]);
    await clickElement(cvssV2items[2]);

    const cvssVector =
      'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N';
    const input = element.querySelector('input[name="cvssVectorInput"]');
    expect(input).toHaveAttribute('value', cvssVector);
  });
});
