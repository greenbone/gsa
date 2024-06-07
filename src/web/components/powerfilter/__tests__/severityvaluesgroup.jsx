/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import {
  openSelectElement,
  getItemElements,
} from 'web/components/form/__tests__/select';

import SeverityValuesGroup from 'web/components/powerfilter/severityvaluesgroup';

import Filter from 'gmp/models/filter';

describe('Severity Values Group Tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('severity>3');
    const name = 'severity';
    const onChange = testing.fn();

    const {element} = render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    expect(element).toMatchSnapshot();
  });

  test('arguments are processed correctly', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('severity=3');
    const name = 'severity';

    const {element} = render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    const formTitle = element.querySelectorAll('label');
    const numField = element.querySelectorAll('input');

    expect(formTitle[0]).toHaveTextContent('foo');
    expect(numField[0]).toHaveAttribute('name', 'severity');
    expect(numField[0]).toHaveAttribute('value', '3');
  });

  test('should initialize value with 0 in case no filter value is given', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('rows=10');
    const name = 'severity';

    const {element} = render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    const numField = element.querySelectorAll('input');

    expect(numField[0]).toHaveAttribute('name', 'severity');
    expect(numField[0]).toHaveAttribute('value', '0');
  });

  test('should change value', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('severity=3');
    const name = 'severity';

    const {element} = render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    const numField = element.querySelectorAll('input');

    fireEvent.change(numField[0], {target: {value: '9'}});

    expect(onChange).toHaveBeenCalledWith(9, 'severity', '=');
  });

  test('should change relationship', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('severity=3');
    const name = 'severity';

    const {element, baseElement} = render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    openSelectElement(element);

    const domItems = getItemElements(baseElement);

    fireEvent.click(domItems[3]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith(3, 'severity', '<');
  });
});
