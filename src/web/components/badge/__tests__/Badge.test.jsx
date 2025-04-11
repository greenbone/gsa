/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Badge from 'web/components/badge/Badge';
import { ReportIcon } from 'web/components/icon/icons';
import {render} from 'web/utils/Testing';
describe('Badge tests', () => {
  test('should render badge', () => {
    const {element} = render(
      <Badge content="1">
        <ReportIcon />
      </Badge>,
    );

    expect(element).toBeVisible();
  });

  test('should render content', () => {
    const {element} = render(<Badge content="1" />);

    expect(element).toHaveTextContent('1');
  });

  test('should render backgroundColor', () => {
    const {getByTestId} = render(<Badge backgroundColor="blue" content="1" />);
    const icon = getByTestId('badge-icon');

    expect(icon).toHaveStyleRule('background-color', 'blue');
  });

  test('should render color', () => {
    const {getByTestId} = render(<Badge color="blue" content="1" />);
    const icon = getByTestId('badge-icon');

    expect(icon).toHaveStyleRule('color', 'blue');
  });

  test('should render position', () => {
    const {getByTestId} = render(<Badge content="1" position="bottom" />);
    const icon = getByTestId('badge-icon');

    expect(icon).toHaveStyleRule('bottom', '0');
  });

  test('should not be dynamic', () => {
    const {getByTestId} = render(<Badge content="1" dynamic={false} />);

    const icon = getByTestId('badge-icon');
    expect(icon).toHaveStyleRule('right', '0');
  });
});
