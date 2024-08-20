/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import FilterStringGroup from '../filterstringgroup';

import Filter from 'gmp/models/filter';

describe('FilterStringGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('');
    const handleChange = testing.fn();
    const {element} = render(
      <FilterStringGroup filter={filter} name="name" onChange={handleChange} />,
    );

    expect(element).toBeInTheDocument();
  });

  test('should render filterstring from string', () => {
    const filter = 'Test';
    const handleChange = testing.fn();
    const {element} = render(
      <FilterStringGroup
        filter={filter}
        name="keyword"
        onChange={handleChange}
      />,
    );

    const input = element.querySelectorAll('input');

    expect(input[0]).toHaveAttribute('value', 'Test');
  });

  test('should render filterstring from filter', () => {
    const filter = Filter.fromString('Test');
    const handleChange = testing.fn();
    const {element} = render(
      <FilterStringGroup filter={filter} name="name" onChange={handleChange} />,
    );

    const input = element.querySelectorAll('input');

    expect(input[0]).toHaveAttribute('value', 'Test');
  });

  test('should return correct keyword name', () => {
    const filter = 'Test';
    const handleChange = testing.fn();
    const {element} = render(
      <FilterStringGroup
        filter={filter}
        name="location"
        onChange={handleChange}
      />,
    );

    const input = element.querySelectorAll('input');

    expect(input[0]).toHaveAttribute('name', 'location');
  });

  test('should call change handler', () => {
    const filter = Filter.fromString('');
    const handleChange = testing.fn();
    const {element} = render(
      <FilterStringGroup filter={filter} name="name" onChange={handleChange} />,
    );

    const input = element.querySelectorAll('input');

    fireEvent.change(input[0], {target: {value: 'Test'}});

    expect(handleChange).toHaveBeenCalledWith('Test', 'name');
  });
});
