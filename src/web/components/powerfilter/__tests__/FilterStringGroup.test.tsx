/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, render, changeInputValue} from 'web/testing';
import Filter from 'gmp/models/filter';
import FilterStringGroup from 'web/components/powerfilter/FilterStringGroup';

describe('FilterStringGroup tests', () => {
  test('should render with default values', () => {
    render(<FilterStringGroup filter="" />);
    expect(screen.getByName('filter')).toHaveValue('');
  });

  test('should allow to set a custom name', () => {
    render(<FilterStringGroup filter="" name="customName" />);
    expect(screen.getByName('customName')).toHaveValue('');
  });

  test('should render filter', () => {
    const filter = Filter.fromString('test="value"');
    render(<FilterStringGroup filter={filter} />);
    expect(screen.getByName('filter')).toHaveValue('test="value"');
  });

  test('should call onChange handler', () => {
    const handleChange = testing.fn();
    render(<FilterStringGroup filter="some filter" onChange={handleChange} />);

    changeInputValue(screen.getByName('filter'), 'new value');
    expect(handleChange).toHaveBeenCalledWith('new value', 'filter');
  });

  test('should render title', () => {
    const title = 'Filter';
    render(<FilterStringGroup filter="" name="foo" />);
    expect(screen.getByText(title)).toBeVisible();
  });
});
