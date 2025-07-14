/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  openSelectElement,
  screen,
  render,
  fireEvent,
  changeInputValue,
} from 'web/testing';
import Filter from 'gmp/models/filter';
import SeverityValuesGroup from 'web/components/powerfilter/SeverityValuesGroup';

describe('Severity Values Group Tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('severity>3');
    const name = 'severity';
    const onChange = testing.fn();

    render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    expect(screen.getByTestId('relation-selector')).toBeVisible();
    expect(screen.getByTestId('severity-value-filter')).toBeVisible();
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

    const numField = screen.getByName('severity');
    expect(numField).toHaveValue('0');
  });

  test('should change value', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('severity=3');

    render(
      <SeverityValuesGroup
        filter={filter}
        name="severity"
        title="foo"
        onChange={onChange}
      />,
    );

    changeInputValue(screen.getByName('severity'), '9');
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

    const select = screen.getByName(name) as HTMLSelectElement;
    await openSelectElement(select);

    const domItems = screen.getSelectItemElements();
    fireEvent.click(domItems[3]);
    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith(3, 'severity', '<');
  });

  test('should render title', () => {
    const title = 'Severity';
    const filter = Filter.fromString('severity=3');
    render(
      <SeverityValuesGroup filter={filter} name="severity" title={title} />,
    );
    expect(screen.getByText(title)).toBeVisible();
  });
});
