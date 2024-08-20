/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import MinQodGroup from '../minqodgroup';

import Filter from 'gmp/models/filter';

describe('MinQodGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('min_qod=10');
    const handleChange = testing.fn();
    const {element} = render(
      <MinQodGroup
        filter={filter}
        name="name"
        qod={20}
        onChange={handleChange}
      />,
    );

    expect(element).toBeInTheDocument();
  });

  test('should render value from filter', () => {
    const filter = Filter.fromString('min_qod=10');
    const handleChange = testing.fn();
    const {element} = render(
      <MinQodGroup filter={filter} name="name" onChange={handleChange} />,
    );

    const input = element.querySelectorAll('input');

    expect(input[0]).toHaveAttribute('value', '10');
  });

  test('should render value from qod by default', () => {
    const filter = Filter.fromString('min_qod=10');
    const handleChange = testing.fn();
    const {element} = render(
      <MinQodGroup
        filter={filter}
        name="name"
        qod={70}
        onChange={handleChange}
      />,
    );

    const input = element.querySelectorAll('input');

    expect(input[0]).toHaveAttribute('value', '70');
  });

  test('should call change handler', () => {
    const filter = Filter.fromString('min_qod=10');
    const handleChange = testing.fn();
    const {element} = render(
      <MinQodGroup
        filter={filter}
        name="name"
        qod={70}
        onChange={handleChange}
      />,
    );

    const input = element.querySelectorAll('input');

    fireEvent.change(input[0], {target: {value: '80'}});

    expect(handleChange).toHaveBeenCalledWith(80, 'name');
  });
});
