/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import ResultsPerPageGroup from '../resultsperpagegroup';

import Filter from 'gmp/models/filter';

describe('ResultsPerPageGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('rows=10');
    const handleChange = testing.fn();
    const {element} = render(
      <ResultsPerPageGroup
        filter={filter}
        name="name"
        rows={20}
        onChange={handleChange}
      />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should render value from filter by default', () => {
    const filter = Filter.fromString('rows=10');
    const handleChange = testing.fn();
    const {element} = render(
      <ResultsPerPageGroup
        filter={filter}
        name="name"
        rows={20}
        onChange={handleChange}
      />,
    );

    const input = element.querySelectorAll('input');

    expect(input[0]).toHaveAttribute('value', '10');
  });

  test('should render value from rows', () => {
    const handleChange = testing.fn();
    const {element} = render(
      <ResultsPerPageGroup name="name" rows={20} onChange={handleChange} />,
    );

    const input = element.querySelectorAll('input');

    expect(input[0]).toHaveAttribute('value', '20');
  });

  test('should call change handler', () => {
    const filter = Filter.fromString('rows=10');
    const handleChange = testing.fn();
    const {element} = render(
      <ResultsPerPageGroup
        filter={filter}
        name="name"
        rows={20}
        onChange={handleChange}
      />,
    );

    const input = element.querySelectorAll('input');

    fireEvent.change(input[0], {target: {value: '15'}});

    expect(handleChange).toHaveBeenCalledWith(15, 'name');
  });
});
