/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, render, changeInputValue} from 'web/testing';
import Filter from 'gmp/models/filter';
import FilterSearchGroup from 'web/components/powerfilter/FilterSearchGroup';

describe('FilterSearchGroup tests', () => {
  test('should render with default values', () => {
    render(<FilterSearchGroup name="test" />);
    expect(screen.getByName('test')).toHaveValue('');
  });

  test('should display filter value', () => {
    const filter = Filter.fromString('test="value"');
    render(<FilterSearchGroup filter={filter} name="test" />);
    expect(screen.getByName('test')).toHaveValue('value');
  });

  test('should call onChange handler', () => {
    const handleChange = testing.fn();
    render(<FilterSearchGroup name="test" onChange={handleChange} />);

    changeInputValue(screen.getByName('test'), 'new value');
    expect(handleChange).toHaveBeenCalledWith('new value', 'test');
  });

  test('should render title', () => {
    const title = 'Test Title';
    render(<FilterSearchGroup name="test" title={title} />);
    expect(screen.getByText(title)).toBeVisible();
  });
});
