/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/utils/testing';
import getLogo from 'web/components/structure/getLogo';

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
  ];

  test.each(testCases)('returns %s for %s', (model, expectedTestId) => {
    const {getByTestId} = render(getLogo(model));
    expect(getByTestId(expectedTestId)).toBeInTheDocument();
  });

  test('returns undefined for unknown model', () => {
    const result = getLogo('unknown_model.svg');
    expect(result).toBeUndefined();
  });
});
