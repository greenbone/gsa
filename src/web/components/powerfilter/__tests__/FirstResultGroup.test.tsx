/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, render, changeInputValue} from 'web/testing';
import Filter from 'gmp/models/filter';
import FirstResultGroup from 'web/components/powerfilter/FirstResultGroup';

describe('FirstResultGroup tests', () => {
  test('should render with default values', () => {
    render(<FirstResultGroup first={0} />);
    expect(screen.getByName('first')).toHaveValue('0');
  });

  test('should allow to set a custom name', () => {
    render(<FirstResultGroup first={0} name="customName" />);
    expect(screen.getByName('customName')).toHaveValue('0');
  });

  test('should render filter first value', () => {
    const filter = Filter.fromString('first=10');
    render(<FirstResultGroup filter={filter} />);
    expect(screen.getByName('first')).toHaveValue('10');
  });

  test('should call onChange handler', () => {
    const handleChange = testing.fn();
    const {rerender} = render(
      <FirstResultGroup first={5} onChange={handleChange} />,
    );
    changeInputValue(screen.getByName('first'), '15');
    expect(handleChange).toHaveBeenCalledWith(15, 'first');

    const filter = Filter.fromString('first=20');
    rerender(<FirstResultGroup filter={filter} onChange={handleChange} />);
    changeInputValue(screen.getByName('first'), '25');
    expect(handleChange).toHaveBeenCalledWith(25, 'first');
  });

  test('should render title', () => {
    const title = 'First result';
    render(<FirstResultGroup />);
    expect(screen.getByText(title)).toBeVisible();
  });
});
