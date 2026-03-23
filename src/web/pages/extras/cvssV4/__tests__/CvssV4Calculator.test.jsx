/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test} from '@gsa/testing';
import {fireEvent, rendererWith, screen, within} from 'web/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import CvssV4Calculator from 'web/pages/extras/cvssV4/CvssV4Calculator';

const gmp = {
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
};

const baseCVSSVector =
  'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N';

const renderCalculator = ({route = '/'} = {}) => {
  const {render} = rendererWith({
    gmp,
    router: true,
    route,
  });

  return render(<CvssV4Calculator />);
};

describe('CvssV4Calculator page tests', () => {
  beforeEach(() => {
    globalThis.history.pushState({}, 'Test Title', '/');
  });
  test('Should render defaults and update vector from input', async () => {
    renderCalculator();

    expect(screen.getByText(baseCVSSVector)).toBeInTheDocument();

    const vectorInput = screen.getByDisplayValue(baseCVSSVector);
    const modifiedVectorInput =
      'CVSS:4.0/AV:P/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N';
    fireEvent.change(vectorInput, {
      target: {
        value: modifiedVectorInput,
      },
    });

    expect(await screen.findByText(modifiedVectorInput)).toBeInTheDocument();
  });

  test('Should render userVector from url', () => {
    const cvssVector =
      'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N/CR:M/MSC:H';

    renderCalculator({route: `/?cvssVector=${encodeURIComponent(cvssVector)}`});

    expect(screen.getByText(cvssVector)).toBeInTheDocument();
  });

  test('Should update vector from selector changes', async () => {
    renderCalculator();

    const attackVectorSelector = screen.getByRole('textbox', {
      name: 'Attack Vector (AV)',
    });
    fireEvent.click(attackVectorSelector);

    const listboxId = attackVectorSelector.getAttribute('aria-controls');
    const attackVectorListbox = document.getElementById(listboxId);
    expect(attackVectorListbox).toBeInTheDocument();

    const localOption = within(attackVectorListbox).getByRole('option', {
      name: 'Local (L)',
    });
    fireEvent.click(localOption);

    const updatedVector =
      'CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N';
    expect(screen.getByDisplayValue(updatedVector)).toBeInTheDocument();
  });
});
