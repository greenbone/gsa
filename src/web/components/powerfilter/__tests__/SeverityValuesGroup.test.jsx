/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import SeverityValuesGroup from 'web/components/powerfilter/SeverityValuesGroup';
import {openSelectElement, screen, render, fireEvent} from 'web/testing';

const getTitle = () => {
  return document.body.querySelector('.mantine-Text-root');
};

const getSeverityInput = () => {
  return document.body.querySelector('.mantine-NumberInput-input');
};

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

    expect(element).toBeVisible();
  });

  test('arguments are processed correctly', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('severity=3');
    const name = 'severity';

    render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    const numField = getSeverityInput();

    expect(getTitle()).toHaveTextContent('foo');
    expect(numField).toHaveAttribute('name', 'severity');
    expect(numField).toHaveAttribute('value', '3');
  });

  test('should initialize value with 0 in case no filter value is given', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('rows=10');
    const name = 'severity';

    render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    const numField = getSeverityInput();

    expect(numField).toHaveAttribute('name', 'severity');
    expect(numField).toHaveAttribute('value', '0');
  });

  test('should change value', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('severity=3');
    const name = 'severity';

    render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    const numField = getSeverityInput();

    fireEvent.change(numField, {target: {value: '9'}});

    expect(onChange).toHaveBeenCalledWith(9, 'severity', '=');
  });

  test('should change relationship', async () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('severity=3');
    const name = 'severity';

    render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    await openSelectElement();

    const domItems = screen.getSelectItemElements();
    fireEvent.click(domItems[3]);
    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith(3, 'severity', '<');
  });
});
