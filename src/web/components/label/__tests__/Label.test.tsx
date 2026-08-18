/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {render, screen} from 'web/testing';
import createLabel from 'web/components/label/Label';

const TestLabel = createLabel(
  '#123456',
  '#654321',
  '#ffffff',
  'test-label',
  'Test label',
);

describe('Label tests', () => {
  test('should render the configured text and test id', () => {
    render(<TestLabel />);

    const label = screen.getByTestId('test-label');

    expect(label).toBeVisible();
    expect(label).toHaveTextContent('Test label');
  });

  test('should apply the configured colors', () => {
    render(<TestLabel />);

    const label = screen.getByTestId('test-label');

    expect(label).toHaveBackgroundColor('#123456');
    expect(label).toHaveBorderColor('#654321');
    expect(label).toHaveColor('#ffffff');
  });

  test('should forward HTML props without overriding the configured test id', () => {
    render(
      <TestLabel
        aria-label="Test label"
        className="custom-label"
        data-testid="custom-test-id"
      />,
    );

    const label = screen.getByTestId('test-label');

    expect(label).toHaveAttribute('aria-label', 'Test label');
    expect(label).toHaveClass('custom-label');
    expect(screen.queryByTestId('custom-test-id')).not.toBeInTheDocument();
  });
});
