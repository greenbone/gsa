/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import FilterSearchGroup from 'web/components/powerfilter/filtersearchgroup';

import Filter from 'gmp/models/filter';

describe('FilterSearchGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('location=tcp');
    const handleChange = testing.fn();
    const {element} = render(
      <FilterSearchGroup
        filter={filter}
        name="location"
        onChange={handleChange}
      />,
    );

    expect(element).toBeInTheDocument();
  });

  test('should render value from filter', () => {
    const filter = Filter.fromString('location=tcp');
    const handleChange = testing.fn();
    const {element} = render(
      <FilterSearchGroup
        filter={filter}
        name="location"
        onChange={handleChange}
      />,
    );
    const input = element.querySelectorAll('input');

    expect(input[0]).toHaveAttribute('value', 'tcp');
  });
  test('should call change handler', () => {
    const filter = Filter.fromString('location=tcp');
    const handleChange = testing.fn();
    const {element} = render(
      <FilterSearchGroup
        filter={filter}
        name="location"
        onChange={handleChange}
      />,
    );

    const input = element.querySelectorAll('input');

    fireEvent.change(input[0], {target: {value: 'general'}});

    expect(handleChange).toHaveBeenCalledWith('general', 'location');
  });
});
