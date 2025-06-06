/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, render} from 'web/testing';
import Badge from 'web/components/badge/Badge';

describe('Badge tests', () => {
  test('should render badge with children', () => {
    render(
      <Badge content="1">
        <span>Test</span>
      </Badge>,
    );

    const badge = screen.getByTestId('badge-icon');
    const children = screen.getByText('Test');

    expect(badge).toBeVisible();
    expect(children).toBeVisible();
  });

  test('should render badge with string content', () => {
    render(<Badge content="1" />);

    const badge = screen.getByTestId('badge-icon');

    expect(badge).toHaveTextContent('1');
  });

  test('should render badge with number content', () => {
    render(<Badge content={2} />);

    const badge = screen.getByTestId('badge-icon');

    expect(badge).toHaveTextContent('2');
  });

  test('should render backgroundColor', () => {
    render(<Badge backgroundColor="blue" content="1" />);
    const icon = screen.getByTestId('badge-icon');
    expect(icon).toHaveStyleRule('background-color', 'blue');
  });

  test('should render color', () => {
    render(<Badge color="blue" content="1" />);
    const icon = screen.getByTestId('badge-icon');
    expect(icon).toHaveStyleRule('color', 'blue');
  });

  test('should render position', () => {
    render(<Badge content="1" position="bottom" />);
    const icon = screen.getByTestId('badge-icon');
    expect(icon).toHaveStyleRule('bottom', '0');
  });

  test('should not be dynamic', () => {
    render(<Badge content="1" dynamic={false} />);
    const icon = screen.getByTestId('badge-icon');
    expect(icon).toHaveStyleRule('right', '0');
  });
});
