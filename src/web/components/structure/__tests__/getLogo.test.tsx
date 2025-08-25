/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, render} from 'web/testing';
import getLogo from 'web/components/structure/getLogo';
import {ApplianceLogo} from 'web/utils/applianceData';

describe('getLogo', () => {
  const testCases = [
    ['gsm-150_label.svg', 'Enterprise150'],
    ['gsm-400_label.svg', 'Enterprise400'],
    ['gsm-400r2_label.svg', 'Enterprise400'],
    ['gsm-450_label.svg', 'Enterprise450'],
    ['gsm-450r2_label.svg', 'Enterprise450'],
    ['gsm-600_label.svg', 'Enterprise600'],
    ['gsm-600r2_label.svg', 'Enterprise600'],
    ['gsm-650_label.svg', 'Enterprise650'],
    ['gsm-650r2_label.svg', 'Enterprise650'],
    ['gsm-5400_label.svg', 'Enterprise5400'],
    ['gsm-6500_label.svg', 'Enterprise6500'],
    ['gsm-ceno_label.svg', 'EnterpriseCeno'],
    ['gsm-deca_label.svg', 'EnterpriseDeca'],
    ['gsm-exa_label.svg', 'EnterpriseExa'],
    ['gsm-peta_label.svg', 'EnterprisePeta'],
    ['gsm-tera_label.svg', 'EnterpriseTera'],
    ['gsm-unknown_label.svg', 'GreenboneWhiteLogo'],
    ['defaultVendorLabel', 'GreenboneWhiteLogo'],
  ];

  test.each(testCases)('returns %s for %s', (logo, expectedTestId) => {
    render(getLogo(logo as ApplianceLogo));
    expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
  });
});
