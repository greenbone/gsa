/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {openSelectElement, screen, fireEvent, render} from 'web/testing';
import Filter from 'gmp/models/filter';
import TaskTrendGroup from 'web/components/powerfilter/TaskTrendGroup';

describe('Task Trend Selector Tests', () => {
  test('should render', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=down');
    const {element} = render(
      <TaskTrendGroup filter={filter} onChange={onChange} />,
    );
    expect(element).toBeVisible();
  });

  test('should return items', async () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=down');

    render(<TaskTrendGroup filter={filter} onChange={onChange} />);

    expect(screen.getSelectItemElements().length).toEqual(5);

    await openSelectElement(screen.getByName('trend') as HTMLSelectElement);

    const domItems = screen.getSelectItemElements();
    expect(domItems.length).toEqual(5);
    expect(domItems[0]).toHaveTextContent('Severity increased');
    expect(domItems[1]).toHaveTextContent('Severity decreased');
    expect(domItems[2]).toHaveTextContent('Vulnerability count increased');
  });

  test('should parse filter', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=same');

    render(<TaskTrendGroup filter={filter} onChange={onChange} />);

    const select = screen.getByName('trend');
    expect(select).toHaveValue('same');
  });

  test('should call onChange handler', async () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=down');

    render(<TaskTrendGroup filter={filter} onChange={onChange} />);

    await openSelectElement(screen.getByName('trend') as HTMLSelectElement);

    const domItems = screen.getSelectItemElements();
    fireEvent.click(domItems[0]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('up', 'trend');
  });

  test('should change value', async () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=down');

    render(<TaskTrendGroup filter={filter} trend="up" onChange={onChange} />);

    const select = screen.getByName('trend') as HTMLSelectElement;
    expect(select).toHaveValue('up');

    await openSelectElement(select);
    const domItems = screen.getSelectItemElements();
    fireEvent.click(domItems[2]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('more', 'trend');
  });

  test('should use title', () => {
    render(<TaskTrendGroup />);
    expect(screen.getByText('Trend')).toBeVisible();
  });
});
