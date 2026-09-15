/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import HaloDot from 'web/components/status/HaloDot';

describe('HaloDot tests', () => {
  test('should render a titled status dot', () => {
    render(
      <HaloDot
        aria-label="Last Contact"
        data-testid="halo-dot"
        title="Last contact 10 seconds ago"
      />,
    );

    expect(screen.getByTestId('halo-dot')).toHaveAttribute(
      'title',
      'Last contact 10 seconds ago',
    );
    expect(screen.getByTestId('halo-dot')).toHaveAttribute(
      'aria-label',
      'Last Contact',
    );
  });
});
