/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import FirstResultGroup from '../firstresultgroup';

import Filter from 'gmp/models/filter';

describe('FirstresultGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('first=1');
    const handleChange = testing.fn();
    const {element} = render(
      <FirstResultGroup
        filter={filter}
        first={1}
        name="name"
        onChange={handleChange}
      />,
    );

    expect(element).toBeInTheDocument();
  });

  test('should render value from filter by default', () => {
    const filter = Filter.fromString('first=1');
    const handleChange = testing.fn();
    const {element} = render(
      <FirstResultGroup
        filter={filter}
        first={2}
        name="name"
        onChange={handleChange}
      />,
    );

    const input = element.querySelectorAll('input');

    expect(input[0]).toHaveAttribute('value', '1');
  });

  test('should render value from first', () => {
    const handleChange = testing.fn();
    const {element} = render(
      <FirstResultGroup first={2} name="name" onChange={handleChange} />,
    );

    const input = element.querySelectorAll('input');

    expect(input[0]).toHaveAttribute('value', '2');
  });

  test('should call change handler', () => {
    const filter = Filter.fromString('first=1');
    const handleChange = testing.fn();
    const {element} = render(
      <FirstResultGroup
        filter={filter}
        first={1}
        name="name"
        onChange={handleChange}
      />,
    );

    const input = element.querySelectorAll('input');

    fireEvent.change(input[0], {target: {value: '2'}});

    expect(handleChange).toHaveBeenCalledWith(2, 'name');
  });
});
