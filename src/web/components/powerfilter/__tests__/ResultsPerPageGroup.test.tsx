/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, render, changeInputValue} from 'web/testing';
import Filter from 'gmp/models/filter';
import ResultsPerPageGroup from 'web/components/powerfilter/ResultsPerPageGroup';

describe('ResultsPerPageGroup tests', () => {
  test('should render', () => {
    render(<ResultsPerPageGroup />);
    expect(screen.getByName('rows')).toBeVisible();
  });

  test('should change results per page', () => {
    const handleChange = testing.fn();
    render(<ResultsPerPageGroup onChange={handleChange} />);

    const input = screen.getByName('rows');
    changeInputValue(input, '50');

    expect(handleChange).toHaveBeenCalledWith(50, 'rows');
  });

  test('should allow to set rows value', () => {
    render(<ResultsPerPageGroup rows={20} />);
    expect(screen.getByName('rows')).toHaveValue('20');
  });

  test("should use filter's rows value if provided", () => {
    const filter = Filter.fromString('rows=30');
    render(<ResultsPerPageGroup filter={filter} />);
    expect(screen.getByName('rows')).toHaveValue('30');
  });

  test('should allow to set name', () => {
    const handleChange = testing.fn();
    render(<ResultsPerPageGroup name="customRows" onChange={handleChange} />);

    const input = screen.getByName('customRows');
    changeInputValue(input, '100');
    expect(handleChange).toHaveBeenCalledWith(100, 'customRows');
  });
});
