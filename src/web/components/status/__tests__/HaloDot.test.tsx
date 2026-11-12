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
    expect(screen.getByTestId('halo-dot')).toHaveStyle({
      backgroundColor: 'rgb(17, 171, 81)',
      width: '12px',
      height: '12px',
    });
    expect(
      window.getComputedStyle(screen.getByTestId('halo-dot')).animation,
    ).toContain('2.2s ease-out infinite');
  });

  test('should support a static colored dot with a custom size', () => {
    render(
      <HaloDot
        $animated={false}
        $color="orange"
        $size="8px"
        data-testid="static-dot"
      />,
    );

    expect(screen.getByTestId('static-dot')).toHaveStyle({
      animation: 'none',
      backgroundColor: 'rgb(255, 165, 0)',
      width: '8px',
      height: '8px',
    });
  });
});
